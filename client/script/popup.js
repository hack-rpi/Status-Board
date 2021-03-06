var popupTitle = '',
		popupBody = '',
		popupPre = '',
		popupDep = new Tracker.Dependency;

// This function is automatically called whenever the displayMessage Session
//  variable is updated
Tracker.autorun(function() {
	var message = Session.get("displayMessage");
	if (message) {
		if (message.title && (message.body || message.pre)) {
			$(".overlayMessage").remove();
			popupTitle = message.title;
			popupBody = message.body;
			popupPre = message.pre;
		}
		else {
			popupTitle = "Internal Error";
			popupBody = "Something went wrong! :(";
		}
		popupDep.changed();
		$("#info-modal").modal('show');
		Session.set("displayMessage", null);
	}
});

Template.popup.helpers({
	title: function() {
		popupDep.depend();
		return popupTitle;
	},
	body: function() {
		popupDep.depend();
		return popupBody;
	},
	pre: function() {
		popupDep.depend();
		return popupPre;
	}
});
