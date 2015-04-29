// Global API Configuration
Restivus.configure({
	useAuth: false,
	prettyJson: true
});

Restivus.addRoute('CommitMessages', { authRequired: true}, {
	get: function() {
		return {
			status: 'success',
			data: []
		};
	},
	post: {
		action: function() {
			try {
				if (this.request.headers['x-github-event'] === 'ping') {
					return {
						statusCode: 200,
						body: {
							status: 'Success',
							message: 'pong'
						}
					};
				}
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
							}
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
