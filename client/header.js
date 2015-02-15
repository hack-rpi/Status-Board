if (Meteor.isClient) {

	Tracker.autorun(function() {
		// function is called automatically whenever the Session variable changes
		// aka MAGIC
		var page_name = Session.get('active-page');
		$('.nav-button').removeClass('nav-button-selected');
		$('#'+page_name).addClass('nav-button-selected');
	});

	$(document).click(function(e) {
		if ($(".user-popup").is(":visible"))
			$(".user-popup").fadeToggle(200);
	});

	Template.header.events({
		'click .nav-button-logout': function(e) {
			Meteor.logout();
		},
		'click #nav-user': function(e) {
			var moveLeft = 20;
			var moveDown = 10;
			var p_position = $("#nav-user").position()
			$(".user-popup").fadeToggle(200)
				.css("top", p_position.top + $("#nav-user").height() +moveDown)
				.css("left", p_position.left + $("#nav-user").width() +moveLeft)
				.appendTo("body");
			e.stopPropagation();
		},
		'click .user-popup-btn': function(e) {
			$(".user-popup").fadeToggle(200);
		}
	});

	Template.header.helpers({
		currentUserName: function() {
			return Meteor.user().username;
		},
	});

}
