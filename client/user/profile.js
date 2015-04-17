
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
      Session.set("displayMessage", {title: "Success", body: "Data saved successfully!"});
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
