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
