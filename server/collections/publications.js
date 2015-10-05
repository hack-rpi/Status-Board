// publish the databases to all clients
Meteor.publish("CommitMessages", function() { return CommitMessages.find(); });
Meteor.publish("RepositoryList", function() { return RepositoryList.find(); });
Meteor.publish("Announcements", function() {  return Announcements.find(); });
Meteor.publish("MentorQueue", function() {    return MentorQueue.find(); });
// users can view all of their own data but only the profiles and usernames
//  of other users
Meteor.publish("userData", function() {
	if (Roles.userIsInRole(this.userId, 'admin')){
		return Meteor.users.find({});
	}
	else {
		return Meteor.users.find({ "_id": this.userId });
	}
	// return Meteor.users.find({});
});

Meteor.publish('AnonReports', function() {
	if (Roles.userIsInRole(this.userId, 'admin')) {
		return AnonReports.find();
	}
});
