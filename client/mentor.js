Template.mentor.helpers({
	allTags: function() {
		// create and return a list of all the tags from the mentors
		Meteor.subscribe('allUserData');
		var mentors = Meteor.users.find({ 
				$and: [
					{ 'profile.role': 'mentor' },
					{ 'profile.active': true }
				] 
			}).fetch();

		if (mentors.length === 0) {
			return; // bail
		}
		
		// make a list of the available tags
		var tags = [];
		for (var m=0; m<mentors.length; m++) {
			var mentor_tags = mentors[m].profile.tags;
			for (var i=0; i<mentor_tags.length; i++) {
				tags.push(mentor_tags[i]);
			}
		}
		return _.unique(tags).sort();
	},
});

Template.mentor.events({
	'focus ._form-group input': function(e) {
		$(e.target)
			.attr('placeholder', '')
		.parent('._form-group').find('label')
			.velocity({'opacity': 1}, 200);
	},
	'blur ._form-group input': function(e) {
		$(e.target)
			.attr('placeholder', $(e.target).attr('name'))
		.parent('._form-group').find('label')
			.velocity({'opacity': 0}, 200);
	},
	'click #findMentor': function() {
		var $form = $('.mentor-request-form'),
			$error_box = $form.find('.form-error'),
			$name = $form.find('input[name="Name"]'),
			$location = $form.find('input[name="Location"]'),
			$phone = $form.find('input[name="Phone Number"]'),
			tag = $form.find('select[name="tags"]').val(),
			now = new Date();

		// check the spam timer
		var prev = Session.get("mentorRequestTimer");
		if (! prev || now > prev ) {

			// error check the fields
			if ($name.val() == '') {
				$error_box.html('<b>Form Error!</b> Please provide your name.');
				Forms.highlightError($name, $error_box);
				return false;
			}
			else if ($location.val() == '') {
				$error_box.html('<b>Form Error!</b> Please provide your location.');
				Forms.highlightError($location, $error_box);
				return false;
			}
			else if (! tag) {
				Session.set('displayMessage', {
					title: 'No Active Mentors',
					body: 'Unfortunately, there are no active mentors to assist you.'
				});
				return false;				
			}
			else {
				if (MentorQueue.insert({
					name: $name.val(),
					loc: $location.val(),
					phone: $phone.val(),
					tag: tag,
					timestamp: now,
					ftime: now.toLocaleString(),
					completed: false,
				})) {
					Session.set('displayMessage', {
						title: 'Mentor Request Sent',
						body: 'Your mentor request has been received.'
					});
					// set a timer to avoid being spammed
					var d = new Date();
					var goTime = new Date(d.getTime() + 5*60000);
					Session.set("mentorRequestTimer", goTime);
					return true;
				}
				else {
					Session.set('displayMessage', {
						title: 'Error',
						body: 'The mentoring system is currently unavailable. ' +
							'Please try again later.'
					});
					return false;
				}
			}
		}
		else {
			Session.set('displayMessage', {
				title: 'Rate Limit Reached',
				body: 'Please do not spam our mentors! Wait at least 5 minutes ' +
					'between requests.'
			});
			return false;
		}
	}
});
