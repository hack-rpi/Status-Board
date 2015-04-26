$(document).click(function(e) {
	if ($(".user-popup").is(":visible"))
		$(".user-popup").fadeToggle(200);
});

Template.navbar.events({
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
		e.stopPropagation();
	}
});

Template.navbar.helpers({
	currentUserName: function() {
		return Meteor.user().username;
	},
});
