Template.user_server_settings.helpers({
  allowAccountCreation: function() {
    Meteor.subscribe('userData');
    return Meteor.user().profile.settings.allow_account_creation;
  },
  mentoringSystemStatus: function() {
    Meteor.subscribe('userData');
    return Meteor.user().profile.settings.mentoring_system;
  },
  alertNumbers: function() {
    Meteor.subscribe('userData');
    if (Meteor.user().settings)
      return Meteor.user().settings.alert_numbers;
    else return [];
  }
});

Template.user_server_settings.events({
  // Account Creating Settings
  'click #admin-allow-account-creation-off-btn': function() {
    Meteor.subscribe("userData");
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.allow_account_creation": false
      }
    });
  },
  'click #admin-allow-account-creation-on-btn': function() {
    Meteor.subscribe("userData");
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.allow_account_creation": true
      }
    });
  },
  // Mentoring Settings
  'click #admin-mentoring-off-btn': function() {
    Meteor.subscribe("userData");
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.mentoring_system": false
      }
    });
  },
  'click #admin-mentoring-on-btn': function() {
    Meteor.subscribe("userData");
    Meteor.users.update( {"_id":Meteor.userId()}, {
      $set: {
        "profile.settings.mentoring_system": true
      }
    });
  },
  'click #add-alert-number-btn': function() {
    var phone = $('#alertNum-input').val();
    $('#alertNum-input').val('');
    if (! phone) return;
    phone = stripPhone(phone);
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
  }
});
