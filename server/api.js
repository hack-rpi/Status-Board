// Global API Configuration
Restivus.configure({
	useAuth: false,
	prettyJson: true
});

// routes to /api/CommitMessages to handle interactions with the
// CommitMessages collection
Restivus.addRoute('CommitMessages', { authRequired: true}, {
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
					var payload = JSON.parse(this.request.body.payload),
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
								language: payload.repository.language
							},
							flags: [],
							total_flags: 0
						})) {
							success_count++;
						}
					}
					if (success_count == 0) {
						return {
							statusCode: 401,
							body: {
								status: 'Fail',
								message: 'You are not authorized to add commit messages.'
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
