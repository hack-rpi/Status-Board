// Global API Configuration
Restivus.configure({
	useAuth: false,
	prettyJson: true
});

Restivus.addRoute('CommitMessages', { authRequired: true}, {
	get: function() {
		console.log("GEEEET!");
		return {
			status: 'success',
			data: []
		};
	},
	post: {
		action: function() {
			if (this.request.headers['x-github-event'] === 'ping') {
				return {
					statusCode: 200,
					body: {
						status: 'Success',
						message: ''
					}
				};
			}
			else if (this.requests.headers['x-github-event'] === 'push') {
				var commits = this.request.body.commits;
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
							id: this.request.body.repository.id,
							name: this.request.body.repository.name,
							full_name: this.request.body.repository.full_name,
							owner: this.request.body.repository.owner,
							description: this.request.body.repository.description,
							url: this.request.body.repository.html_url,
							homepage: this.request.body.repository.homepage,
							language: this.request.body.repository.language
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
	}
});
