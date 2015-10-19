// Global API Configuration
API = new Restivus({
	apiPath: 'api',
	prettyJson: true
});

crypto = Npm.require('crypto');

var signPayload = function(payload) {
	return 'sha1=' + crypto.createHmac('sha1', Meteor.settings.secret_key)
		.update(payload)
		.digest('hex')
};

var signPayloadTwilio = function(payload) {
	var url = Meteor.settings.root_url + '/api/Mentor';
	_.each(
		_.sortBy(
			Object.keys(payload), function(x) { return x; }
		), function(k) { url += k + payload[k]}
	);
	return crypto.createHmac('sha1', Meteor.settings.twilio_token)
		.update(url)
		.digest('base64');
};

var formTwilioResponse = function(code, message) {
	if (message) {
		// return {
		// 	statusCode: code,
		// 	headers: {
		// 		'Content-Type': 'text/xml'
		// 	},
		// 	body: '<?xml version="1.0" encoding="UTF-8"?>' +
		// 		'<Response>' +
		// 			'<Sms>' + message + '</Sms>' +
		// 		'</Response>'
		// };
		return {
			statusCode: code,
			headers: {
				'Content-Type': 'text/plain'
			},
			body: message
		};
	}
	else {
		return {
			statusCode: code,
			headers: {
				'Content-Type': 'text/xml'
			},
			body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
		};
	}
}

// routes to /api/CommitMessages to handle interactions with the
// CommitMessages collection
API.addRoute('CommitMessages', { authRequired: false}, {
	get: function() {
		return {
			status: 'success',
			data: []
		};
	},
	post: {
		action: function() {
			// expecting post requests from GitHub formatted appropriately
			// all other requests will currently return a 500 error
			try {
				if (this.request.headers['x-hub-signature'] !==
						signPayload(JSON.stringify(this.request.body))) {
					return {
						statusCode: 401,
						body: {
							status: 'Unauthorized',
							message: 'Authorization failure.'
						}
					};
				}
				// GitHub will send a ping event whenever a webhook is created
				// all we have to do ping it back
				if (this.request.headers['x-github-event'] === 'ping') {
					return {
						statusCode: 200,
						body: {
							status: 'Success',
							message: 'pong'
						}
					};
				}
				/*
				* Incoming GitHub push event *
				Note that if the payload contains multiple commits, we will add all
					of them
				Status Codes:
						400 - No commits found in the payload
						401 - No commits could be added, possible collection insertion
										authorization failure or the commit message(s) have
										already been added to the collection
						206 - Partial Success: some of the commit messages were added
										but not all
						201 - Success: all of the commit messages in the payload were
										successfully added to the collection
				*/
				else if (this.request.headers['x-github-event'] === 'push') {
					var payload = this.request.body,
					 		commits = payload.commits;
					if (commits.length === 0) {
						return {
							statusCode: 400,
							body: {
								status: 'Fail',
								message: 'No commit messages found.'
							}
						};
					}
					var success_count = 0;
					for (var i = 0; i < commits.length; i++) {
						if (! commits[i].distinct ||
							CommitMessages.findOne({_id:commits[i].id})) {
							continue;
						}
						var v_date = Meteor.call('validateDate', commits[i].timestamp);
						if (CommitMessages.insert({
							_id: commits[i].id,
							text: commits[i].message,
							url: commits[i].url,
							date: v_date,
							fdate: Meteor.call('formatDateTime', v_date),
							author: {
								name: commits[i].author.name,
								email: commits[i].author.email,
								username: commits[i].author.username
							},
							repo: {
								id: payload.repository.id,
								name: payload.repository.name,
								full_name: payload.repository.full_name,
								owner: payload.repository.owner,
								description: payload.repository.description,
								url: payload.repository.html_url,
								homepage: payload.repository.homepage,
								language: {
									name: payload.repository.language,
									color: languageColors[payload.repository.language]
								}
							},
							flags: [],
							total_flags: 0
						})) {
							success_count++;
						}
					}
					if (success_count == 0) {
						return {
							statusCode: 409,
							body: {
								status: 'Conflict',
								message: 'No commit messages could be added.'
							}
						};
					}
					else if (success_count < commits.length) {
						return {
							statusCode: 206,
							body: {
								status: 'Partial Success',
								message: 'Added ' + success_count + ' of ' + commits.length +
									' commit messages successfully.'
							}
						};
					}
					else {
						return {
							statusCode: 201,
							body: {
								status: 'Success',
								message: 'Commit messages successfully added to the database.'
							}
						};
					}
				} // end push event
			}
			// unrecognized post request format
			catch (e) {
				console.log(e);
				return {
					statusCode: 500,
					body: {
						status: 'Internal Server Error',
						message: []
					}
				}
			}
		} // end action function
	} // end post
});


// routes to /api/Mentor to handle interactions with twilio and mentors
API.addRoute('Mentor', {authRequired: false} , {
	get: function() {
		return {
			status: 'success',
			data: []
		};
	},
	post: {
		action: function() {
			try {
				// incoming requests are only authorized to come from Twilio
				// all other will receive a 401 error
				if (this.request.headers['x-twilio-signature'] !==
						signPayloadTwilio(this.request.body)) {
					return {
						statusCode: 401,
						body: {
							status: 'Unauthorized',
							message: 'Authorization failure.'
						}
					};
				}
				/*
				* Incoming Twilio POST *
				Note that Twilio will
				Status Codes:
						200 - something happened. If twilio receives a 4-- error then
										messages are not sent to the client
				*/
				var fromNum = this.request.body.From.substring(2),
						msg = this.request.body.Body.toUpperCase()
							.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
						mentor_doc = Meteor.users.findOne({ 'profile.phone': fromNum });
				if (! mentor_doc || ! Roles.userIsInRole(mentor_doc._id, 'mentor')) {
					return formTwilioResponse(404, '');
				}

				if (msg === 'DONE') {
					if (! mentor_doc.profile.mentee_id) {
						return formTwilioResponse(200, 'You currently do not have a task.');
					}
					else {
						var mentee_doc = MentorQueue.findOne({
							'_id': mentor_doc.profile.mentee_id });
						Meteor.users.update({ '_id': mentor_doc._id }, {
				      $set: {
				        'profile.available': true,
				        'profile.mentee_id': null
				      },
				      $push: {
				        'profile.history': {
				          'name': mentee_doc.name,
				          '_id': mentee_doc._id,
				          'tag': mentee_doc.tag,
				          'loc': mentee_doc.loc,
				          'time': (new Date()).toLocaleString()
				        }
				      }
				    });
						return formTwilioResponse(200, 'Task Completed. Nice work!');
					}
				}
				else if (msg === 'WAIVE') {
					if (! mentor_doc.profile.mentee_id) {
						return formTwilioResponse(200, 'You currently do not have a task.');
					}
					else {
						var mentee_doc = MentorQueue.findOne({'_id': mentor_doc.profile.mentee_id });
				    MentorQueue.update({ '_id': mentee_doc._id }, {
				      $set: { 'completed': false }
				    }, function(error, result) {
				      if (mentee_doc.phone) {
				        Meteor.call('sendText', mentee_doc.phone, mentor_doc.profile.name +
				          ' was called away. You have been added back into the queue.');
				      }
				    });
						Meteor.users.update({ '_id': mentor_doc._id }, {
							$set: {
								'profile.available': true,
								'profile.active': false,
								'profile.mentee_id': null,
							}
				    });
						return formTwilioResponse(200,
							'Your assignment has been waived and you are no longer active.');
					}
				}
				else if (msg === 'SUSPEND') {
					if (mentor_doc.profile.mentee_id) {
						var mentee_doc = MentorQueue.findOne({'_id': mentor_doc.profile.mentee_id });
				    MentorQueue.update({ '_id': mentee_doc._id }, {
				      $set: { 'completed': false }
				    }, function(error, result) {
				      if (mentee_doc.phone) {
				        Meteor.call('sendText', mentee_doc.phone, mentor_doc.profile.name +
				          ' was called away. You have been added back into the queue.');
				      }
				    });
						Meteor.users.update({ '_id': mentor_doc._id }, {
							$set: {
								'profile.available': true,
								'profile.active': false,
								'profile.mentee_id': null,
							}
				    });
					}
					Meteor.users.update({ '_id': mentor_doc._id }, {
						$set: {
							'profile.available': true,
							'profile.active': false,
							'profile.mentee_id': null,
						}
					});
					return formTwilioResponse(200, 'You are no longer active.');
				}
				else if (msg === 'ACTIVATE') {
					Meteor.users.update({ '_id': mentor_doc._id }, {
						$set: {
							'profile.available': true,
							'profile.active': true,
						}
					});
					return formTwilioResponse(200, 'You are now active.');
				}
				else {
					return formTwilioResponse(200,
						'Valid commands: done, waive, suspend, activate');
				}
			}
			// internal server--return 500 error
			catch (e) {
				return {
					statusCode: 500,
					body: {
						status: 'Failure',
						data: [e]
					}
				};
			}
		}
	}
});


API.addRoute('swag', {authRequired: false}, {
	get: function() {
		return {
			statusCode: 200,
			body: {
				data: []
			}
		};
	}
});
