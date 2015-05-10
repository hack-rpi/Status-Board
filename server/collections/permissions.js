// COLLECTION PRIVELEDGES
Meteor.users.allow({
	insert: function(userId, doc) {
		// users should only be added on the server via the Accounts package
		return false;
	},
	remove: function(userId, doc) {
		if (Roles.userIsInRole(userId, 'admin'))
			return true;
		else
			return false;
	},
	update: function(userId, doc, fieldNames, modifier) {
		// users can only edit their own data
		if (doc._id == userId || Roles.userIsInRole(userId, 'admin'))
			return true;
		else
			return false;
	}
});

CommitMessages.allow({
	insert:function(userId, doc) {
		// done server side
		return false;
	},
	remove: function(userId, doc) {
		if (Roles.userIsInRole(userId, 'admin'))
			return true;
		else
			return false;
	},
	update: function(userId, doc, fieldNames, modifier) {
		var upVoteMod = {
					$inc: {
						total_flags: 1
					},
					$addToSet: {
						flags: {
							id: userId
						}
					}
				},
				downVoteMod = {
					$inc: {
						total_flags: -1
					},
					$pull: {
						flags: {
							id: userId
						}
					}
				};
		if (Roles.userIsInRole(userId, 'admin'))
			return true;
		// verify that voting is completed legitimently
		// user can only modify the flag and total_flag fields,
		// modifier must either be upVoteMod or downVoteMod defined above
		// check that user can only inc up/down once
		else if (_.every(fieldNames, function(f) {
					return f === 'flags' || f === 'total_flags'})
				&& ((_.isEqual(modifier, upVoteMod) && ! _.contains(doc.flags, { id: userId }))
					|| (_.isEqual(modifier, downVoteMod) && _.contains(doc.flags, { id: userId }))))
			return true;
		else
			return false;
	}
});

RepositoryList.allow({
	insert: function(userId, doc) {
		var user_doc = Meteor.users.findOne({ '_id': userId });
		// any logged in user can insert a repo as long as they are not yet
		// attached to one
		if (user_doc && ! user_doc.profile.repositoryId
				&& ! RepositoryList.findOne({ 'contributors': {
							$elemMatch: { 'id': 5, 'handle': user_doc.profile.github_handle }
						}
					}))
			return true;
		else
			return false
	},
	remove: function(userId, doc) {
		var user_doc = Meteor.users.findOne({ '_id': userId });
		// a user can only remove a repo that no one is attached to
		if (doc.contributors.length === 0)
			return true;
		else
			return false;
	},
	update: function(userId, doc, fieldNames, modifier) {
		var user_doc = Meteor.users.findOne({ '_id': userId }),
				userSet = {
					id: userId,
					handle: user_doc.profile.github_handle
				},
				removeUser = {
					$pull: {
						contributors: userSet
					}
				},
				addUser = {
					$addToSet: {
						contributors: userSet
					}
				};
		// a user can only modify the repo doc that s/he is attached to
		if (user_doc.profile.repositoryId === doc._id) {
			// if the user if modifying the userIds/collab field, they may only edit
			// his/her own entry
			if (_.contains(fieldNames, 'contributors')) {
				if (_.isEqual(modifier, removeUser) || _.isEqual(modifier, addUser))
					return true;
				else
					return false;
			}
			// user can edit the other fields freely
			else if (_.some(doc.contributors, function(x) { return _.isEqual(x, userSet); })
					&& _.intersection(fieldNames, ['webhook', 'name', 'full_name', 'url'])
						.length !== 0)
				return true;
		}
		else
			return false;
	}
});

Announcements.allow({
	insert: function(userId, doc) {
		if (Roles.userIsInRole(userId, ['announcer', 'admin']))
			return true;
		else
			return false;
	},
	remove: function(userId, doc) {
		if (Roles.userIsInRole(userId, ['announcer', 'admin']))
			return true;
		else
			return false;
	},
	update: function(userId, doc, fieldNames, modifier) {
		if (Roles.userIsInRole(userId, ['announcer', 'admin']))
			return true;
		else
			return false;
	}
});

MentorQueue.allow({
	insert: function(userId, doc) {
		return Meteor.users.findOne({ "_id":admin_id }).profile.settings.mentoring_system;
	},
	remove: function(userId, doc) {
		if (Roles.userIsInRole(userId, 'mentor', 'admin'))
			return true;
		else
			return false;
	},
	update: function(userId, doc) {
		if (Roles.userIsInRole(userId, ['mentor', 'admin']))
			return true;
		else
			return false;
	}
});

AnonReports.allow({
	insert: function(userId, doc) {
		return true;
	},
	remove: function(userId, doc) {
		return Roles.userIsInRole(userId, 'admin');
	},
	update: function(userId, doc) {
		return Roles.userIsInRole(userId, 'admin');
	}
})
