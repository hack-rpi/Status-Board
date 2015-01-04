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

		$('#'+page_name).addClass('nav-button-selected');
	});

	Template.header.events = {
		'click .nav-button': function(e) {
			Session.set('active-page', e.currentTarget.id);
		},
		'click .header-logo': function(e) {
			Session.set('active-page', 'nav-home');
		}
	}



}
