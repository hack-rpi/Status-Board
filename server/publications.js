// publish the databases to all clients
Meteor.publish("CommitMessages", function() { return CommitMessages.find(); });
Meteor.publish("RepositoryList", function() { return RepositoryList.find(); });
Meteor.publish("Announcements", function() {  return Announcements.find(); });
Meteor.publish("Mentors", function() {        return Mentors.find(); });
Meteor.publish("MentorQueue", function() {    return MentorQueue.find(); });
// users can view all of their own data but only the profiles and usernames
//  of other users
Meteor.publish("userData", function() {
		return Meteor.users.find({ "_id": this.userId });
});
Meteor.publish("allUserData", function() {
	return Meteor.users.find({}, {
		fields: {
				username: 1,
				profile: 1,
			}
		});
});
Meteor.publish("userRoles", function  () {
	return Roles.getAllRoles();
});

// COLLECTION PRIVELEDGES
Meteor.users.allow({
	insert:function() {
		if (Roles.userIsInRole(Meteor.user(), 'admin'))
			return true;
	},
	remove:function() {
		if (Roles.userIsInRole(Meteor.user(), 'admin'))
			return true;
	},
	update:function(userId, targer_user) {
		// users can only edit their own data
		if (target_user._id == UserId || Roles.userIsInRole(Meteor.user(), 'admin')) {
			return true;
		}
		else
			return false;
	}
});
CommitMessages.allow({
	insert:function() {
		if (Roles.userIsInRole(Meteor.user(), 'flagger'))
			return true;
	},
	remove:function() {
		if (Roles.userIsInRole(Meteor.user(), 'flagger'))
			return true;
	},
	update:function() {
		if (Roles.userIsInRole(Meteor.user(), 'flagger'))
			return true;
	}
});
RepositoryList.allow({
	insert:function() {
		return true;
	},
	remove:function() {
		// if (Roles.userIsInRole(Meteor.user(), 'admin'))
			return true;
	},
	update:function() {
		// if (Roles.userIsInRole(Meteor.user(), 'admin'))
		return true;
	}
});
Announcements.allow({
	insert:function() {
		if (Roles.userIsInRole(Meteor.user(), 'announcer'))
			return true;
	},
	remove:function() {
		if (Roles.userIsInRole(Meteor.user(), 'announcer'))
			return true;
	},
	update:function() {
		if (Roles.userIsInRole(Meteor.user(), 'announcer'))
			return true;
	}
})
Mentors.allow({
	insert:function() {
		if (Roles.userIsInRole(Meteor.user(), 'mentor'))
			return true;
	},
	remove:function() {
		if (Roles.userIsInRole(Meteor.user(), 'mentor'))
			return true;
	},
	update:function() {
		if (Roles.userIsInRole(Meteor.user(), 'mentor'))
			return true;
	}
});
MentorQueue.allow({
	insert:function() {
		return Meteor.users.findOne({ "_id":admin_id }).profile.settings.mentoring_system;
	},
	remove:function() {
		if (Roles.userIsInRole(Meteor.user(), 'mentor'))
			return true;
	},
	update:function() {
		if (Roles.userIsInRole(Meteor.user(), 'mentor'))
			return true;
	}
});
