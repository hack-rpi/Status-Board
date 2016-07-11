Template.check_in.helpers({
	'checkin_page': function () {
		if (Session.equals('checkin_page', 'register')) {
			$('.checkin-panel .checkin-return-btn').show();
			return 'register';
		}
		else if (Session.equals('checkin_page', 'success')) {
			Meteor.setTimeout(function() {
				$('.checkin-panel .checkin-return-btn').hide();
				$('.checkin-success-container')
					.velocity('transition.slideUpBigIn', 1000);
			}, 100);
			return 'check_in_success';
		}
		else {
			Meteor.setTimeout(function() {
				$('.checkin-panel .checkin-return-btn').hide();
				$('.checkin-container')
					.velocity('transition.slideUpBigIn', 1000);
			}, 100);
			return 'check_in_main';
		}
	}
});

Template.check_in_main.helpers({
	'validated': function () {
		return Session.get('validated');
	}
});

var checkin_code = null;

Template.check_in.events({
	'click .checkin-btn': function (e) {
		var $btn = $(e.target),
			action = $btn.attr('data-action');
		switch (action) {
			case 'validate-code':
				var $code = $('.validate input[name="Code"]');
				Meteor.call('validateCheckInCode', $code.val(), function (error, result) {
					if (error) {
						Session.set('displayMessage', {
							title: 'Error',
							body: 'Something went wrong validating the code'
						});
						return;
					}
					if (result) {
						checkin_code = $code.val();
						Session.set('validated', true);
					}
					else {
						Forms.highlightError($code);
					}
				});
				break;
			case 'checkin':
				var $email = $('.confirm-checkin input[name="Email"]'),
					$wifi_username = $('.confirm-checkin input[name="WiFi Username"]'),
					wifi_username = $wifi_username.val();
				Meteor.call('checkInUser', checkin_code, $email.val(), wifi_username, function (error, result) {
					if (error) {
						var $form_error = $('.confirm-checkin .form-error');
						$form_error
							.html(error.message)
							.show();
						Forms.highlightError($email, $form_error);
					}
					else {
						Session.set('checkin_page', 'success');
					}
				});
				break;
			case 'home':
				Session.set('checkin_page', 'main');
				break;
			case 'register':
				Session.set('checkin_page', 'register');
				break;
			default: break;
		}
	}
});