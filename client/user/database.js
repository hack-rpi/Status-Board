Template.user_database.rendered = function() {
	Session.setDefault('db_page', 'db_anonReport');
};

Template.user_database.helpers({
	db_page: function() {
		return Session.get('db_page');
	}
});

Template.user_database.events({
	'change #selectDatabase': function() {
		Session.set('db_page', $('#selectDatabase').val());
	}
});


Template.db_anonReport.helpers({
	reports: function() {
		Meteor.subscribe('AnonReports');
		return AnonReports.find();
	}
});

Template.db_anonReport.events({
	'change .selectAction': function() {
		var action = $('.selectAction#' + this._id).val()
		$('.selectAction#' + this._id).val('');
		switch(action) {
			case 'complete':
				AnonReports.update({ '_id': this._id }, {
					$set: { 'addressed': true }
				});
				break;
			case 'incomplete':
				AnonReports.update({ '_id': this._id }, {
					$set: { 'addressed': false }
				});
				break;
			case 'remove':
				if (confirm('Are you sure you want to delete this entry?')) {
					AnonReports.remove({ '_id': this._id });
				}
				break;
			default: break;
		}
	}
});
