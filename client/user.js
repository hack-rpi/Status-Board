if (Meteor.isClient) {

  Template.user.rendered = function() {
    Session.set("active-page", "nav-user");
    Session.set("user-page", "user_profile");
    $(".user-sidebar-btn").removeClass("active");
    $("#user-profile-btn").addClass("active");
  };


  Template.user.helpers({
    user_page: function() {
      var page = Session.get("user-page");
      $(".user-sidebar-btn").removeClass("active");
      $("#"+page).addClass("active");
      if (page == "user-settings-btn")
        return "user_settings";
      else if (page == "user-hacker-btn")
        return "user_hacker";
      else if (page == "user-mentor-btn")
        return "user_mentor";
      else if (page == "user-volunteer-btn")
        return "user_volunteer";
      else if (page == "user-announcements-btn")
        return "user_announcements";
      else if (page == "user-database-btn")
        return "user_database";
      else if (page == "user-server-settings-btn")
        return "user_server_settings";
      else {
        $("#user-profile-btn").addClass("active");
        return "user_profile";
      }
    },
  });


  Template.user.events({
    'click .user-sidebar-btn': function(e) {
      Session.set("user-page", e.currentTarget.id);
    }
  });

// =============================================================================

  Template.user_profile.helpers({
    userName: function() {
      if (Meteor.userId())
        return Meteor.user().username;
      else return "";
    },
    name: function() {
      if (Meteor.userId())
        return Meteor.user().profile.name;
      else return "";
    },
    affiliation: function() {
      if (Meteor.userId())
        return Meteor.user().profile.affiliation;
      else return "";
    },
    projectName: function() {
      if (Meteor.userId())
        return Meteor.user().profile.project_name;
      else return "";
    },
    location: function() {
      if (Meteor.userId())
        return Meteor.user().profile.location;
      else return "";
    },
    editActive: function() {
      user_profile_edit_dep.depend();
      return user_profile_edit;
    },
  });

  var user_profile_edit = false;
  var user_profile_edit_dep = new Tracker.Dependency;

  Template.user_profile.events({
    'click #user-profile-edit-btn': function(e) {
      e.preventDefault();
      user_profile_edit = true;
      user_profile_edit_dep.changed();
    },
    'click #user-profile-save-btn': function(e, t) {
      // check edits and save to db
      e.preventDefault();
      Meteor.subscribe("userData");
      var old_profile = Meteor.user().profile;

      var new_name = t.find("#UPedit-name").value;
      var new_affiliation = t.find("#UPedit-affiliation").value;
      var new_projectname = t.find("#UPedit-projectname").value;
      var new_location = t.find("#UPedit-location").value;

      if (Meteor.users.update({ "_id": Meteor.userId() }, {
          $set: {
            "profile.name": new_name,
            "profile.affiliation": new_affiliation,
            "profile.project_name": new_projectname,
            "profile.location": new_location
          }
      })) {
        // data save successfully
        Session.set("displayMessage", {title: "Error", body: "Data saved successfully!"});
      }
      else {
        // data failed to save
        Session.set("displayMessage", {title: "Error", body: "Something went wrong saving the data! You may not have permission to perform this action."});
      }

      user_profile_edit = false;
      user_profile_edit_dep.changed();
    },
    'click #user-profile-cancel-btn': function(e) {
      e.preventDefault();
      user_profile_edit = false;
      user_profile_edit_dep.changed();
    },
  });

}
