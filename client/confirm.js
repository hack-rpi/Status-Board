Template.confirm.rendered = function() {
	Meteor.subscribe('UserData', Meteor.userId());
}

Template.confirm.helpers({
	accepted: function() {
		try {
			return Meteor.user().settings.accepted.flag;
		}
		catch (e) {
			return false;
		}
	},
	confirmed: function() {
		try {
			return Meteor.user().settings.confirmed.flag;
		}
		catch (e) {
			return false;
		}
	},
	expire_date: function() {
		try {
			return Meteor.user().settings.accepted.expires.toDateString();
		}
		catch (e) {
			return '';
		}
	},
	travel: function() {
		try {
			return Meteor.user().settings.accepted.travel.method;
		}
		catch (e) {
			return '';
		}
	},
	reimbursement: function() {
		try {
			return Meteor.user().settings.accepted.travel.reimbursement;
		}
		catch (e) {
			return '';
		}
	}
});

Template.confirm.events({
	'change input[name="travel"]': function(event) {
		var val = $(event.target).attr('value');
		if (val == 'reject') {
			$('.travel-explaination').show();
		}
		else {
			$('.travel-explaination').hide();
		}
	},
	'click .btn[data-action="confirm"]': function(event) {
		var accept_travel = $('.accept-travel input:checked').attr('value') === 'accept',
			$explaination = $('.travel-explaination input'),
			explaination = $explaination.val();
		if (! accept_travel && explaination === '') {
			Forms.highlightError($explaination);
			return false;
		}
		Meteor.call('userConfirmAcceptance', accept_travel, explaination, 
					function(err, res) {
			if (err) {
				Session.set('displayMessage', {
					title: err.error,
					body: err.reason
				});
			}
			else {
				Session.set('displayMessage', {
					title: 'You did it!',
					body: 'We can\'t wait to see you on Nov 14-15!' +
						' We will be in touch shortly about travel ' + 
						' arrangements, if applicable.'
				});
			}
		});
	},
	'click .btn[data-action="reject"]': function(event) {
		if (confirm('Are you sure you want to give up your spot at HackRPI 2015?')) {
			Meteor.call('userRejectAcceptance', function(err, res) {
				if (err) {
					Session.set('displayMessage', {
						title: err.error,
						body: err.reason
					});
				}
				else {
					Session.set('displayMessage', {
						title: 'You have relinquished your spot.',
						body: 'We\'re sorry to hear that you won\'t be joining us' +
							' this year. Perhaps we will see you next year!' 
					});
				}
			});
		}
	}
});