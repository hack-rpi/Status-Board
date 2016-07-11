Template.user.rendered = function() {
  // get to see if we have an incoming code from GitHub
  if (window.location.search) {
    params = window.location.search.split('&').map(function(d) { return d.split('='); });
    if (params.length > 1 && params[0][0] === '?code' && params[1][0] === 'state') {
      // grab access token
      Meteor.call('getGitHubAccessToken', params[0][1], params[1][1], Meteor.userId(),
        function(error, result) {
          if (! error) {
            // if we got an access token then create a webhook
            Meteor.call('createRepositoryWebhook', Meteor.userId(),
              function(error, result) {
                if (! error) {
                  Session.set('displayMessage', {
                    title: 'Success',
                    body: 'Github was connected successfully and a webhook was '
                      + 'created. Happy hacking!'
                  });
                }
                else {
                  Session.set('displayMessage', {
                    title: error.error,
                    body: error.reason
                  });
                }
              });
            // then grab any (at most 30) commits that we may have missed
            Meteor.call('addCommits', Meteor.userId(),
              function(error, result) {
                if (error) {
                  Session.set('displayMessage', {
                    title: error.error,
                    body: error.reason
                  });
                }
              }
            );
          }
          else {
            Session.set('displayMessage', {
              title: error.error,
              body: error.reason
            });
          }
      });
    }
  }
};

Template.user.helpers({
  user_page: function() {
    var page = Session.get('user-page');
    if (page === 'hacker')
      return 'user_hacker';
    else if (page === 'mentor')
      return 'user_mentor';
    else if (page === 'volunteer')
      return 'user_volunteer';
    else if (page === 'announcements')
      return 'user_announcements';
    else if (page === 'database')
      return 'user_database';
    else if (page === 'server-settings')
      return 'user_server_settings';
    else
      return 'user_profile';
  },
  hasAnnouncerAccess: function() {
    return Roles.userIsInRole(Meteor.userId(), ['admin', 'announcer']);
  }
});

Template.user.events({
  'click .user-sidebar-btn': function(e) {
    Session.set('user-page', $(e.target).attr('value'));
  }
});
