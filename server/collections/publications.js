// publish the databases to all clients
Meteor.publish("CommitMessages", function() { return CommitMessages.find(); });
Meteor.publish("RepositoryList", function() { return RepositoryList.find(); });
Meteor.publish("Announcements", function() {  return Announcements.find(); });
Meteor.publish("MentorQueue", function() {    return MentorQueue.find(); });
// users can view all of their own data but only the profiles and usernames
//  of other users
Meteor.publish("UserData", function(userId) {
	if (Roles.userIsInRole(userId, 'admin')){
		return Meteor.users.find();
	}
	else if (userId) {
		return Meteor.users.find({ "_id": userId });
	}
	else {
		this.ready();
	}
});

Meteor.publish('MentorData', function() {
	return Meteor.users.find({
		roles: 'mentor'
	}, {
		fields: { 
			'profile.tags': 1,
			'profile.active': 1,
			'profile.available': 1,
			'roles': 1
		}
	});
})

Meteor.publish('AnonReports', function() {
	if (Roles.userIsInRole(this.userId, 'admin')) {
		return AnonReports.find();
	}
});

Meteor.publish('AnonUserData', function() {
	if (Roles.userIsInRole(this.userId, 'admin')) {
		return AnonUserData.find();
	}
})
