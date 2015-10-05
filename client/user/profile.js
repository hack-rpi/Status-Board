
Template.user_profile.helpers({
  email: function() {
    if (Meteor.userId() && Meteor.user().emails)
      return Meteor.user().emails[0].address;
    else return "";
  },
  name: function() {
    if (Meteor.userId()) {
      console.log(Meteor.user().profile.name);
      return Meteor.user().profile.name;
    }
    else return "";
  },
  affiliation: function() {
    if (Meteor.userId())
      return Meteor.user().profile.affiliation;
    else return "";
  },
  phone: function() {
    if (Meteor.userId())
      return Meteor.user().profile.phone;
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
    var new_phone = t.find("#UPedit-phone").value;
    var new_location = t.find("#UPedit-location").value;

    if (Meteor.users.update({ "_id": Meteor.userId() }, {
        $set: {
          "profile.name": new_name,
          "profile.affiliation": new_affiliation,
          "profile.phone": new_phone,
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
