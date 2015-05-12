Template.user_database.rendered = function() {
	Session.setDefault('db-page', 'db_anonReport');
	$('#selectDatabase').val( Session.get('db-page') );
	Session.set('paginate-page', 0);
	Session.set('table-sort', ['null']);
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
	},
	'click .table-sort': function(e) {
		$('.table-sort .sort-symbol').empty();
		var field = $(e.target).attr('sort'),
				curr_sort = Session.get('table-sort');
		if (field === curr_sort[0] && curr_sort[1] === 'desc') {
			$('.table-sort[sort="' + field + '"] .sort-symbol').append(
				'<i class="fa fa-caret-up"></i>'
			);
			Session.set('table-sort', [field, 'asc']);
		}
		else {
			$('.table-sort[sort="' + field + '"] .sort-symbol').append(
				'<i class="fa fa-caret-down"></i>'
			);
			Session.set('table-sort', [field, 'desc']);
		}
	}
});
/* -----------------------------------------------------------------------------
	ANNOUNCEMENTS
*/
Template.db_announcements.rendered = function() {
	Meteor.subscribe('Announcements');
	Session.set('paginate-page', 0);
	$('.prev-btn').addClass('disabled');

	Tracker.autorun(function() {
		var max = Announcements.find({}).fetch().length;
		if (Session.equals('db-page', 'db_announcements')) {
			Session.set('paginate-max', max);
			if (max <= 10) $('.next-btn').addClass('disabled');
			else $('.next-btn').removeClass('disabled');
		}
	});
};

Template.db_announcements.helpers({
	announcements: function() {
		return Announcements.find({}, {
			sort: [['startTime', 'desc']],
			skip: Session.get('paginate-page'),
			limit: 10
		});
	}
});

Template.db_announcements.events({
	'change .selectAction': function() {
		var action = $('.selectAction#' + this._id).val();
		$('.selectAction#' + this._id).val('');
		switch(action) {
			case 'view':
				Session.set('displayMessage', {
					title: 'Announcement Doc ' + this._id,
					pre: JSON.stringify(Announcements.findOne({ '_id': this._id }),
						null, 2)
				});
				break;
			case 'remove':
				if (confirm('Are you sure you want to delete this entry?')) {
					Announcements.remove({ '_id': this._id });
				}
				break;
			default: break;
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
	COMMIT MESSAGES
*/
Template.db_commitMessages.rendered = function() {
	Meteor.subscribe('CommitMessages');
	Session.set('paginate-page', 0);
	Session.set('table-sort', ['date', 'desc']);
	$('.table-sort .sort-symbol').empty();
	$('.table-sort[sort="date"] .sort-symbol').append(
		'<i class="fa fa-caret-down"></i>'
	);
	$('.prev-btn').addClass('disabled');

	Tracker.autorun(function() {
		var max = CommitMessages.find({}).fetch().length;
		if (Session.equals('db-page', 'db_commitMessages')) {
			Session.set('paginate-max', max);
			if (max <= 10) $('.next-btn').addClass('disabled');
			else $('.next-btn').removeClass('disabled');
		}
	});
};

Template.db_commitMessages.helpers({
	commits: function() {
		return CommitMessages.find({}, {
			sort: [Session.get('table-sort')],
			skip: Session.get('paginate-page'),
			limit: 10
		});
	}
});

Template.db_commitMessages.events({
	'change .selectAction': function() {
		var action = $('.selectAction#' + this._id).val()
		$('.selectAction#' + this._id).val('');
		switch(action) {
			case 'view':
				Session.set('displayMessage', {
					title: 'CommitMessages Doc ' + this._id,
					pre: JSON.stringify(CommitMessages.findOne({ '_id': this._id }),
						null, 2)
				});
				break;
			case 'remove':
				if (confirm('Are you sure you want to delete this entry?')) {
					CommitMessages.remove({ '_id': this._id });
				}
				break;
			default: break;
		}
	},

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
			case 'view':
				Session.set('displayMessage', {
					title: 'MentorQueue Doc ' + this._id,
					pre: JSON.stringify(MentorQueue.findOne({ '_id': this._id }),
						null, 2)
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

/* -----------------------------------------------------------------------------
	REPOSITORYLIST
*/
Template.db_repositoryList.rendered = function() {
	Meteor.subscribe('RepositoryList');
	Session.set('paginate-page', 0);
	$('.prev-btn').addClass('disabled');

	Tracker.autorun(function() {
		var max = RepositoryList.find({}).fetch().length;
		if (Session.equals('db-page', 'db_repositoryList')) {
			Session.set('paginate-max', max);
			if (max <= 10) $('.next-btn').addClass('disabled');
			else $('.next-btn').removeClass('disabled');
		}
	});
};

Template.db_repositoryList.helpers({
	repositories: function() {
		return RepositoryList.find({}, {
			sort: ['name'],
			skip: Session.get('paginate-page'),
			limit: 10
		});
	}
});

Template.db_repositoryList.events({
	'click .selectAction': function() {
		var action = $('.selectAction#' + this._id).val();
		$('.selectAction#' + this._id).val('');
		switch(action) {
			case 'view':
				Session.set('displayMessage', {
					title: 'RepositoryList Document ' + this._id,
					pre: JSON.stringify(RepositoryList.findOne({ '_id': this._id }),
						null, 2)
				});
				break;
			case 'remove':
				if (confirm('Are you sure you want to delete this entry?')) {
					RepositoryList.remove({ '_id': this._id });
				}
				break;
			default: break;
		}
	}
});

/* -----------------------------------------------------------------------------
	USERS
*/
Template.db_users.rendered = function() {
	Meteor.subscribe('userData');
	Session.set('paginate-page', 0);
	Session.set('table-sort', ['profile.name', 'desc']);
	$('.table-sort .sort-symbol').empty();
	$('.table-sort[sort="profile.name"] .sort-symbol').append(
		'<i class="fa fa-caret-down"></i>'
	);
	$('.prev-btn').addClass('disabled');

	Tracker.autorun(function() {
		var max = Meteor.users.find({}).fetch().length;
		if (Session.equals('db-page', 'db_users')) {
			Session.set('paginate-max', max);
			if (max <= 10) $('.next-btn').addClass('disabled');
			else $('.next-btn').removeClass('disabled');
		}
	});
};

Template.db_users.helpers({
	users: function() {
		return Meteor.users.find({}, {
			sort: [Session.get('table-sort')],
			skip: Session.get('paginate-page'),
			limit: 10
		});
	}
});

Template.db_users.events({
	'click .selectAction': function() {
		var action = $('.selectAction#' + this._id).val();
		$('.selectAction#' + this._id).val('');
		switch(action) {
			case 'role_admin':
				if (confirm('Are you sure you want to make this user an ADMIN?')) {
					Meteor.users.update({ '_id': this._id }, {
						$set: { 'roles': ['admin'] }
					});
				}
				break;
			case 'role_hacker':
				if (confirm('Are you sure you want to make this user a HACKER?')) {
					Meteor.users.update({ '_id': this._id }, {
						$set: { 'roles': ['hacker'] }
					});
				}
					break;
			case 'role_mentor':
				if (confirm('Are you sure you want to make this user a MENTOR?')) {
					Meteor.users.update({ '_id': this._id }, {
						$set: { 'roles': ['mentor'] }
					});
				}
				break;
			case 'role_announcer':
				if (confirm('Are you sure you want to make this user an ANNOUNCER?')) {
					Meteor.users.update({ '_id': this._id }, {
						$set: { 'roles': ['announcer'] }
					});
				}
				break;
			case 'view':
				Session.set('displayMessage', {
					title: 'Users Document ' + this._id,
					pre: JSON.stringify(Meteor.users.findOne({ '_id': this._id }),
						null, 2)
				});
				break;
			case 'remove':
				if (confirm('Are you sure you want to delete this entry?')) {
					Meteor.users.remove({ '_id': this._id });
				}
				break;
			default: break;
		}
	}
});
