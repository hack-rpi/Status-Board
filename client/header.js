if (Meteor.isClient) {

	Tracker.autorun(function() {
		// function is called automatically whenever the Session variable changes
		// aka MAGIC
		var page_name = Session.get('active-page');
		$('.nav-button').removeClass('nav-button-selected');
		$('#'+page_name).addClass('nav-button-selected');
	});

	Template.header.events({
		'click .nav-button-logout': function() {
			Meteor.logout();
		},
		'click #nav-user': function() {
			Session.set("selectedUserId", Meteor.userId());
		}
	});

	Template.header.helpers({
		currentUserName: function() {
			return Meteor.user().username;
		},
	});

}
