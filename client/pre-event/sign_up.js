Template.sign_up.rendered = function() {
	$('.splash-text')
		.velocity({
			height: '230px',
			width: '50%',
			left: '25%',
			padding: '50px 20px',
			top: '200px'
		}, 1500);
	$('.splash-header, .splash-content, .splash-subheader')
		.delay(1500)
		.velocity('fadeIn');
};

Template.sign_up.helpers({

});

Template.sign_up.events({
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
	'click .goto-register-btn': function() {
		$('.register-container')
			.velocity('scroll', 1500);
	},
	'click .splash-nav-btn': function(e) {
		var $btn = $(e.target),
				target = $btn.attr('data-target');
		switch (target) {
			case 'login':
				$('.splash-text').velocity({
					height: '440px'
				}, 1000);
				$('.splash-login')
					.delay(1000)
					.velocity('fadeIn');
				break;
			case 'profile':
				Router.go('/user');
				break;
			case 'hackrpi':
				location.assign('http://www.hackrpi.com');
				break;
			case 'status-what':
				$('.status-what-container')
					.velocity('scroll', 1500);
				break;
			default:
				break;
		}
	},
	'click .login-btn': function(e) {
		var email = $('.splash-login input[name="Email"]').val(),
				password = $('.splash-login input[name="Password"]').val();
		Meteor.loginWithPassword(email, password, function(error) {
			if (error) {
				Session.set('displayMessage', {
					title: 'Login Error',
					body: 'Invalid email or password'
				});
			}
			else {
				Router.go('/user');
			}
		});
	}
});
