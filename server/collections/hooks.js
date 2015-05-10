AnonReports.after.insert(function(userId, doc) {
	Meteor.call('sendAlerts', 'ALERT! An anonymous report has been filed.');
});
