Template.user_database.rendered = function() {
	Session.setDefault('db-page', 'db_anonReport');
	$('#selectDatabase').val( Session.get('db-page') );
	Session.set('paginate-page', 0);
};

Template.user_database.helpers({
	db_page: function() {
		return Session.get('db-page');
	},
	page_num: function() {
		return Math.floor(Session.get('paginate-page') / 10) + 1;
	},
	page_max: function() {
		return Math.floor(Session.get('paginate-max') / 10) + 1;
	}
});

Template.user_database.events({
	'change #selectDatabase': function() {
		Session.set('db-page', $('#selectDatabase').val());
	},
	'click .prev-btn': function() {
		if (Session.get('paginate-page') >= 10) {
			$('.next-btn').removeClass('disabled');
			Session.set('paginate-page', Session.get('paginate-page') - 10);
		}
		if (Session.get('paginate-page') <= 0) {
			$('.prev-btn').addClass('disabled');
		}

	},
	'click .next-btn': function() {
		if (Session.get('paginate-page') + 10 <= Session.get('paginate-max')) {
			$('.prev-btn').removeClass('disabled');
			Session.set('paginate-page', Session.get('paginate-page') + 10);
		}
		if (Session.get('paginate-page') + 10 >= Session.get('paginate-max')) {
			$('.next-btn').addClass('disabled');
		}
	}
});

/* -----------------------------------------------------------------------------
	ANON REPORTS
*/
Template.db_anonReport.rendered = function() {
	Meteor.subscribe('AnonReports');
	Session.set('paginate-page', 0);
	$('.prev-btn').addClass('disabled');

	Tracker.autorun(function() {
		var max = AnonReports.find({}).fetch().length;
		if (Session.equals('db-page', 'db_anonReport')) {
			Session.set('paginate-max', max);
			if (max <= 10) $('.next-btn').addClass('disabled');
			else $('.next-btn').removeClass('disabled');
		}
	});

};

Template.db_anonReport.helpers({
	reports: function() {
		return AnonReports.find({}, {
			sort: ['addressed', ['timestamp', 'desc']],
			skip: Session.get('paginate-page'),
			limit: 10
		});
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

/* -----------------------------------------------------------------------------
	MENTOR QUEUE
*/
Template.db_mentorQueue.rendered = function() {
	Meteor.subscribe('MentorQueue');
	Session.set('paginate-page', 0);
	$('.prev-btn').addClass('disabled');

	Tracker.autorun(function() {
		var max = MentorQueue.find({}).fetch().length;
		if (Session.equals('db-page', 'db_mentorQueue')) {
			Session.set('paginate-max', max);
			if (max <= 10) $('.next-btn').addClass('disabled');
			else $('.next-btn').removeClass('disabled');
		}
	});

};

Template.db_mentorQueue.helpers({
	queue: function() {
		return MentorQueue.find({}, {
			sort: ['completed', ['timestamp', 'desc']],
			skip: Session.get('paginate-page'),
			limit: 10
		});
	}
});

Template.db_mentorQueue.events({
	'click .selectAction': function() {
		var action = $('.selectAction#' + this._id).val();
		$('.selectAction#' + this._id).val('');
		switch(action) {
			case 'complete':
				MentorQueue.update({ '_id': this._id}, {
					$set: { 'completed': true }
				});
				break;
			case 'incomplete':
				MentorQueue.update({ '_id': this._id}, {
					$set: { 'completed': false }
				});
				break;
			case 'remove':
				if (confirm('Are you sure you want to delete this entry?')) {
					MentorQueue.remove({ '_id': this._id });
				}
				break;
			default: break;
		}
	}
});
