var user_states = {};

Meteor.methods({
	getGitHubRedirect: function(userId) {
		var state = Random.secret();
		if (! Meteor.users.find({ '_id': userId }))
			throw new Meteor.Error('GitHub Error', 'Invalid userId.');
		user_states[userId] = state;
		return 'https://github.com/login/oauth/authorize?'
        + 'client_id=' + Meteor.settings.github_clientId
				+ '&redirect_uri=' + Meteor.settings.root_url + '/user'
				+ '&scope=admin:repo_hook,admin:org_hook'
				+ '&state=' + state;
	},

	getGitHubAccessToken: function(code, state, userId) {
		var url = 'https://github.com/login/oauth/access_token?'
			+ 'client_id=' + Meteor.settings.github_clientId
			+ '&client_secret=' + Meteor.settings.github_secret
			+ '&code=' + code
		try {
			if (user_states[userId] != state) {
				throw new Meteor.Error('State-Error',
					'bad state! request created by third party!');
			}
			delete user_states[userId];
			Meteor.http.post(url, {
				headers: {
					'User-Agent': 'Meteor/1.1'
				}
			}, function(error, result) {
				var content = decodeURIComponent(result.content).split('&')
					.map(function(d) { return d.split('='); });
				Meteor.users.update({ '_id': userId }, {
					$set: {
						'services.Github.access_token': content[0][1],
						'services.Github.scope': content[1][1].split(','),
						'services.Github.token_type': content[2][1]
					}
				});
			});
		}
		catch (e) {
			throw new Meteor.Error('GitHub Error', 'Unable to obtain access token.')
		}
	},

	createRepositoryWebhook: function(userId) {
		var user_doc = Meteor.users.findOne({ '_id': userId }),
				repo_doc = RepositoryList.findOne({ '_id': user_doc.profile.repositoryId });
		try {
			return Meteor.http.post(
				'https://api.github.com/repos/' + repo_doc.full_name + '/hooks'
					+ '?access_token=' + user_doc.services.Github.access_token,
				{
					headers: {
						'User-Agent': 'Meteor/1.1'
					},
					data: {
						'name': 'web',
						'active': true,
						'events': ['push'],
						'config': {
							'url': Meteor.settings.root_url + '/api/CommitMessages',
							'content-type': 'json'
						}
					}
				}, function(error, result) {
					RepositoryList.update({ '_id': repo_doc._id }, {
						$set: {
							'webhook.created': true,
							'webhook.createdBy': userId,
							'webhook.id': result.data.id,
							'webhook.events': result.data.events
						}
					});
				});
		}
		catch (e) {
			throw new Meteor.Error('GitHub Error', 'Unable to create webhook.');
		}
	},

	deleteRepositoryWebhook: function(userId, repo_full_name, hookId) {
		var user_doc = Meteor.users.findOne({ '_id': userId });
		try {
			return Meteor.http.del(
				'https://api.github.com/repos/' + repo_full_name + '/hooks/'
					+ hookId
					+ '?access_token=' + user_doc.services.Github.access_token,
				{
					headers: {
						'User-Agent': 'Meteor/1.1'
					}
				});
		}
		catch (e) {
			console.log(e);
			throw new Meteor.Error('GitHub Error', 'Unable to delete webhook.');
		}
	}
});
