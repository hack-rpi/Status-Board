/*
Server methods for making calls to the GitHub API
*/

// keeps track of the state variables sent with OAuth requests
// user_states[USER_ID] = STATE
var user_states = {};

Meteor.methods({
	// returns a URL to direct the user to GitHub to yeild an access token
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

	// takes the CODE and STATE returned from GitHub and retrieves an access
	// token. stores the token, scope, and token type in the services.Gitub
	// field in the user's document
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

	// creates a webhook on the repository that the given user is attached to
	// and updates that repository's document after the webhook has been created
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
							'content_type': 'json',
							'secret': Meteor.settings.secret_key
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

	// deletes the webhook given full repo's name and hookId
	deleteRepositoryWebhook: function(userId, repoDoc) {
		var user_doc = Meteor.users.findOne({ '_id': userId });
		try {
			return Meteor.http.del(
				'https://api.github.com/repos/' + repoDoc.full_name + '/hooks/'
					+ repoDoc.webhook.id
					+ '?access_token=' + user_doc.services.Github.access_token,
				{
					headers: {
						'User-Agent': 'Meteor/1.1'
					}
				}, function(error, result) {
					if (error)
						throw error;
					else {
						RepositoryList.update({ '_id': repoDoc._id }, {
							$set: {
								'webhook.created': false,
								'webhook.createdBy': '',
								'webhook.id': '',
								'webhook.events': []
							}
						});
					}
				});
		}
		catch (e) {
			console.log(e);
			throw new Meteor.Error('GitHub Error', 'Unable to delete webhook.');
		}
	},

	// retreives the commit messages in the master branch for a given
	// repository using a user's access token
	getRepoCommitData: function(token, full_repo_name) {
		try {
			return Meteor.http.get(
				'https://api.github.com/repos/' + full_repo_name + '/commits',
				{
					headers: {
						'User-Agent': 'Meteor/1.1'
					},
					params: {
						access_token: token
					}
				}
			);
		}
		catch (e) {
			throw new Meteor.Error('GitHub Error',
				'Unable to retrieve commit messages.');
		}
	},

	// retrieves the information about a given repository (full name) using
	// a user's access token
	getRepositoryData: function(token, full_repo_name) {
		try {
			return Meteor.http.get(
				'https://api.github.com/repos/' + full_repo_name,
				{
					headers: {
						'User-Agent': 'Meteor/1.1'
					},
					params: {
						access_token: token
					}
				}
			);
		}
		catch (e) {
			throw new Meteor.Error('GitHub Error',
				'Unable to retrieve repository data.');
		}
	},

	// grabs the 30 most recent commits from a given repository using a user's
	// access token and adds all of the new commits to the collection
	addCommits: function(userId) {
		var user_doc = Meteor.users.findOne({ '_id': userId }),
				token = user_doc.services.Github.access_token,
				full_repo_name = RepositoryList.findOne({
					'_id': user_doc.profile.repositoryId
				}).full_name;
		try {
			// make synchronous calls (blocking)
			var commits_result = Meteor.call('getRepoCommitData', token, full_repo_name),
					repo_result = Meteor.call('getRepositoryData', token, full_repo_name);
		}
		catch (e) {
			throw e;
		}
		try {
			var commits = JSON.parse(commits_result.content),
					raw_repo_data = JSON.parse(repo_result.content),
					// create repo object to attach to every commit
					repo_data = {
						id: raw_repo_data.id,
						name: raw_repo_data.name,
						full_name: raw_repo_data.full_name,
						owner: {
							name: raw_repo_data.owner.login,
							email: raw_repo_data.owner.email,
						},
						description: raw_repo_data.description,
						url: raw_repo_data.html_url,
						homepage: raw_repo_data.homepage,
						language: {
							name: raw_repo_data.language,
							color: languageColors[raw_repo_data.language]
						}
					};
			// loop over all the commits that were found
			// stop if we get to something we've already added
			for (var i=0; i<commits.length; i++) {
				// check if this commit was already added to the collection
				if (CommitMessages.findOne({ '_id': commits[i].sha })) {
					// all of the rest will not be new either so stop here
					break;
				}
				// if this sha doesn't already exist in the database then it is new
				else {
					// capture and store all of the data
					var v_date = Meteor.call('validateDate',
						commits[i]['commit']['author']['date']);
					CommitMessages.insert({
						_id : commits[i].sha,
						text : commits[i].commit.message,
						url: commits[i].html_url,
						date : v_date,
						fdate :  Meteor.call('formatDateTime', v_date),
						author: {
							name: commits[i].commit.author.name,
							email: commits[i].commit.author.email,
							username: commits[i].author.login
						},
						repo: repo_data,
						flags: [],
						total_flags: 0
					});
				}
			} // end commits for loop
		}
		catch (e) {
			console.log(e);
			throw new Meteor.Error('GitHub Error',
				'Unable to parse commit messages.');
		}
	},

	validateDate: function(dt) {
		// if a commit has a date in the future compared to the server time, then
		//  assign it the server time
		var now = new Date();
		now.setHours( now.getHours() + 5 ); // UTC
		if (dt > now) {
			dt = now;
		}
		return dt;
	},

	formatDateTime: function(dt) {
		var year  = parseInt(dt.substr(0,4),10);
		var month = parseInt(dt.substr(5,2),10);
		var day   = parseInt(dt.substr(8,2),10);
		var hour  = parseInt(dt.substr(11,2),10);
		var min   = parseInt(dt.substr(14,2),10);
		var sec   = parseInt(dt.substr(17,2),10);
		month--; // JS months start at 0

		var d = new Date(year,month,day,hour,min,sec);
		d = d.toLocaleString(0,24);

		return d.substr(0,24);
	}
});
