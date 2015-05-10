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
