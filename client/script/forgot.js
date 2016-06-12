Template.forgot.rendered = function() {
	
}

Template.forgot.helpers({
	
});

Template.forgot.events({
	'click .btn': function(event) {
		var action = $(event.target).attr('data-action');
		switch (action) {
			case 'send-reset':
				var $email = $('.forgot-container input[name="Email"]'),
					email = $email.val();
				if (! email) {
					Forms.highlightError($email);
					return false;
				}
				$('.forgot-container .btn').hide();
				$('.forgot-container .loading').show();
				Meteor.call('sendPasswordResetEmail', email, function(err, res) {
					if (err) {
						Session.set('displayMessage', {
							title: err.error,
							body: err.reason
						});
					}
					else {
						Session.set('displayMessage', {
							title: 'Password Reset Email Sent',
							body: 'An email has been sent to you.' +
								' Check your email for further instructions.'
						});
					}
					$('.forgot-container .loading').hide();
					$('.forgot-container .btn').show();
				});
				break;
			default: break;
		}
	}
});