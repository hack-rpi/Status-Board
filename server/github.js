var user_states = {};

Meteor.methods({
	getGitHubRedirect: function(userId) {
		var state = Random.secret();
		if (! Meteor.users.find({ '_id': userId }))
			throw 'bad userId';
		user_states[userId] = state;
		return 'https://github.com/login/oauth/authorize?'
        + 'client_id=' + Meteor.settings.github_clientId
				+ '&redirect_uri=http://localhost:3000/user'
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
				console.log(state);
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
			return e;
		}
	}
});
