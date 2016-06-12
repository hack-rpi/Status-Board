Template.user_server_settings.helpers({
  allowAccountCreation: function() {
    Meteor.subscribe('UserData', Meteor.userId());
    return Meteor.user().profile.settings.allow_account_creation;
  },
  mentoringSystemStatus: function() {
    Meteor.subscribe('UserData', Meteor.userId());
    return Meteor.user().profile.settings.mentoring_system;
  },
  alertNumbers: function() {
    Meteor.subscribe('UserData', Meteor.userId());
    if (Meteor.user().settings)
      return Meteor.user().settings.alert_numbers;
    else return [];
  },
  stage: function() {
    if (Meteor.user().settings) {
      var stage = Meteor.user().settings.event_stage;
      return [
        {
          name: 'Registration',
          value: 'registration',
          checked: stage === 'registration'
        },
        {
          name: 'Check-In',
          value: 'check-in',
          checked: stage === 'check-in'
        },
        {
          name: 'Main Event',
          value: 'main-event',
          checked: stage === 'main-event'
        }
      ];
    }
    else return [];
  }
});

Template.user_server_settings.events({
  // Account Creating Settings
  'click #admin-allow-account-creation-off-btn': function() {
    Meteor.subscribe("UserData", Meteor.userId());
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.allow_account_creation": false
      }
    });
  },
  'click #admin-allow-account-creation-on-btn': function() {
    Meteor.subscribe("UserData", Meteor.userId());
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.allow_account_creation": true
      }
    });
  },
  // Mentoring Settings
  'click #admin-mentoring-off-btn': function() {
    Meteor.subscribe("UserData", Meteor.userId());
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.mentoring_system": false
      }
    });
  },
  'click #admin-mentoring-on-btn': function() {
    Meteor.subscribe("UserData", Meteor.userId());
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.mentoring_system": true
      }
    });
  },
  // alert numbers
  'click #add-alert-number-btn': function() {
    var phone = $('#alertNum-input').val();
    $('#alertNum-input').val('');
    if (! phone) return;
    phone = Forms.stripPhone(phone);
    Meteor.users.update({ '_id': Meteor.userId() }, {
      $push: {
        'settings.alert_numbers': phone
      }
    });
  },
  'click .alert-num-remove': function() {
    Meteor.users.update({ '_id': Meteor.userId() }, {
      $pull: {
        'settings.alert_numbers': this + ''
      }
    });
  },
  // event stage
  'change .event-stage': function(e) {
    var stage = $(e.target).attr('value');
    Meteor.users.update({ '_id': Meteor.userId() }, {
      $set: {
        'settings.event_stage': stage
      }
    });
  }
});
