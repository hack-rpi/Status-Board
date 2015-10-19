Router.route('/', function () {
  var self = this;
  Meteor.call('getEventState', function (error, result) {
    switch (result) {
      case 'registration':
        self.layout('pre-eventLayout');
        self.render('sign_up');
        break;
      case 'check-in':
        self.layout('pre-eventLayout');
        self.render('check_in');
        break;
      default:
        self.layout('defaultLayout');
        self.render('commits');
    }
  });

  self.render('welcome');
});

Router.route('checkin', function() {
  self.layout('pre-eventLayout');
  self.render('check_in');
})

Router.route('mentor');
Router.route('info');
Router.route('login');
Router.route('register');
Router.route('user');

Router.configure({
  layoutTemplate: 'defaultLayout',
  notFoundTemplate: '404'
});
