Accounts.onResetPasswordLink(function(token, done) {
	console.log(token);
	Router.go('/set-password');
	Session.set('resetPasswordToken', token);
	done();
});

Template.setPassword.rendered = function() {
	
}

Template.setPassword.helpers({
	
});

Template.setPassword.events({
	'click .btn': function(event) {
		var action = $(event.target).attr('data-action');
		switch (action) {
			case 'set-password':
				var $pass1 = $('.set-password-container input[name="New Password"]'),
					pass1 = $pass1.val(),
					$pass2 = $('.set-password-container input[name="Confirm New Password"]'),
					pass2 = $pass2.val();
				if (! Forms.isValidPassword(pass1)) {
					Forms.highlightError($pass1)
					
					return false;
				}
				else if (pass1 !== pass2) {
					Forms.highlightError($pass2);
					
					return false;
				}
				var token = Session.get('resetPasswordToken');
				Accounts.resetPassword(token, pass1, function(err) {
					if (err) {
						Session.set('displayMessage', {
							title: err.error,
							body: err.reason
						});
					}
					else {
						Session.set('displayMessage', {
							title: 'Success!',
							body: 'Your password has been changed successfully.'
						});
						Router.go('/user');
					}
				});
				break;
			default: break;
		}
	}
});