ServiceConfiguration.configurations.upsert(
	{ service: 'github' },
	{
		$set: {
			clientId: Meteor.settings.github_clientId,
			loginStyle: 'redirect',
			secret: Meteor.settings.github_secret
		}
	}
);
