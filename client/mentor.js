Template.mentor.helpers({
	allTags: function() {
		// create and return a list of all the tags from the mentors
		Meteor.subscribe("allUserData");
		var mentors = Meteor.users.find({ $and: [
				{"profile.role": "mentor"},
				{"profile.active": true}
			] }).fetch();

		if (mentors.length == 0)
			return; // bail

		var tagSet = new Set();
		for (var m=0; m<mentors.length; m++) {
			for (var i=0; i<mentors[m]["profile"]["tags"].length; i++) {
				tagSet.add(mentors[m]["profile"]["tags"][i]);
			}
		}
		// convert to an array for spacebars
		var arrayTags = [];
		tagSet.forEach(function(value){ arrayTags.push(value) });
		return arrayTags.sort();
	},
});

Template.mentor.events({
	'click #findMentor': function() {
		var name = $("#inputFindMentorName").val();
		var loc = $("#inputFindMentorLocation").val();
		var phone = $("#inputFindMentorPhone").val();
		var tag = $("#inputIssueTags").val();
		var now = new Date();

		// check the spam timer
		var prev = Session.get("mentorRequestTimer");
		// prev = false; // debug
		if (!prev || now > prev ) {

			// error check the fields
			if (name == "")
				alert("Name field cannot be empty!");
			else if (loc == "")
				alert("Location field cannot be empty!");
			else if (!tag)
				alert("What's the issue deary?");
			else {
				if (MentorQueue.insert({
					name: name,
					loc: loc,
					phone: phone,
					tag: tag,
					timestamp: now,
					completed: false,
				})) {
					$("<div>", {
						"class": "alert alert-success alert-dismissible",
						text: "Mentor requested successfully! If you provided a phone number, \
										we will text you when a mentor is looking for you!"
					}).append('<button type="button" class="close" \
											data-dismiss="alert" aria-hidden="true">\
											&times;</button>').appendTo("#findMentorAlertBox");

					// set a timer to avoid being spammed
					var d = new Date();
					var goTime = new Date(d.getTime() + 5*60000);
					Session.set("mentorRequestTimer", goTime);
				}
				else {
					$("<div>", {
						"class": "alert alert-danger alert-dismissible",
						text: "Sorry, the mentoring system is not currently active. \
									Please try again later."
					}).append('<button type="button" class="close" \
											data-dismiss="alert" aria-hidden="true">\
											&times;</button>').appendTo("#findMentorAlertBox");
				}




			}
		}
		else {
			alert("Please don't spam our mentors :( \n Wait at least 5 minutes between requests!");
		}
	}
});
