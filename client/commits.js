Template.commits.helpers({
	message: function() {
		// return only the ten most recent commits
		Meteor.subscribe("CommitMessages");
		return CommitMessages.find({}, {sort: {date:-1}, limit:10});
	},
});
