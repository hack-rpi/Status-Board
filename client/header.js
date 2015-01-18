if (Meteor.isClient) {

	Tracker.autorun(function() {
		// function is called automatically whenever the Session variable changes
		// aka MAGIC
		var page_name = Session.get('active-page');
		$('#nav-home').removeClass('nav-button-selected');
		$('#nav-repo').removeClass('nav-button-selected');
		$('#nav-commits').removeClass('nav-button-selected');
		$('#nav-mentor').removeClass('nav-button-selected');
		$('#nav-info').removeClass('nav-button-selected');
		$('#nav-login').removeClass('nav-button-selected');
		$('#nav-manage').removeClass('nav-button-selected');

		$('#'+page_name).addClass('nav-button-selected');
	});

	Template.header.events({
		'click .nav-button-logout': function() {
			Meteor.logout();
		},
	});

	Template.header.helpers({
		currentUserName: function() {
			return Meteor.user().username;
		},
	});

}