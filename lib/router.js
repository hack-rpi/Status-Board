/**
 * lib/router.js
 * 
 * This file contains the calls to the iron router plugin to control routes to
 *  templates and files.
 */

Router.route('/', function () {
  var self = this;
  switch (Meteor.settings.public.event_state) {
    case 'preregistration':
      self.layout('pre-eventLayout');
      self.render('preregister');
      break;
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

Router.route('checkin', function() {
  var self = this;
  self.layout('pre-eventLayout');
  self.render('check_in');
});

Router.route('confirm', function() {
  var self = this;
  self.layout('pre-eventLayout');
  self.render('confirm');
});

Router.route('mentor');
Router.route('info');
Router.route('login');
Router.route('register');
Router.route('user');
Router.route('forgot');
Router.route('set-password');

Router.configure({
  layoutTemplate: 'defaultLayout',
  notFoundTemplate: '404'
});
