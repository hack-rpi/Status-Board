
Template.user_profile.helpers({
  email: function() {
    if (Meteor.userId() && Meteor.user().emails)
      return Meteor.user().emails[0].address;
    else return "";
  },
  name: function() {
    if (Meteor.userId()) {
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
    else return '';
  },
  school: function() {
    if (Meteor.userId())
      return Meteor.user().profile.school;
    else return "";
  },
  bus: function() {
    if (Meteor.userId())
      return Meteor.user().profile.bus;
    else return "";
  },
  diet: function() {
    if (Meteor.userId())
      return Meteor.user().profile.diet;
    else return [];
  },
  resume: function() {
    if (Meteor.userId())
      return Meteor.user().profile.resume;
    else return '';
  },
  editActive: function() {
    user_profile_edit_dep.depend();
    return user_profile_edit;
  },
  allBuses: function() {
    if (Meteor.userId()) {
      return _.map(Meteor.settings.public.buses, function(route) {
        return {
          route: route,
          selected: Meteor.user().profile.bus === route
        }
      });
    }
    else return Meteor.settings.public.buses;
  },
  allDiets: function() {
    if (Meteor.userId()) {
      return _.map(Meteor.settings.public.diet, function(name) {
        return {
          name: name,
          selected: _.contains(Meteor.user().profile.diet, name)
        }
      });
    }
    else return Meteor.settings.public.diet;
  }
});

var user_profile_edit = false;
var user_profile_edit_dep = new Tracker.Dependency;

Template.user_profile.events({
  'click #user-profile-edit-btn': function(e) {
    e.preventDefault();
    user_profile_edit = true;
    user_profile_edit_dep.changed();
  },
  'change #user-profile input[name="resume"]': function() {
    var resume_file = $('#user-profile input[name="resume"]')[0].files[0];
    if (! resume_file) 
      return;
    else if (resume_file.type !== 'application/pdf') {
      Session.set('displayMessage', {
        title: 'Resume Error',
        body: 'Resume upload must be a PDF.'
      });
      return;
    } 
    else if (resume_file.size / 1024 > 1024) {
      Session.set('displayMessage', {
        title: 'Resume Error',
        body: 'Maximum resume file size is 1MB.'
      });
      return;
    }
    var reader = new FileReader();
    reader.onload = function(event) {
      var binary_data = new Uint8Array(reader.result);
      Meteor.users.update({ _id: Meteor.userId() }, {
        $set: {
          'profile.resume': binary_data
        }
      });
    }
    reader.readAsArrayBuffer(resume_file);
  },
  'click #user-profile-save-btn': function(e, t) {
    // check edits and save to db
    e.preventDefault();
    Meteor.subscribe("userData");
    var old_profile = Meteor.user().profile;

    var new_name = t.find("#UPedit-name").value,
        new_affiliation = t.find("#UPedit-affiliation").value,
        new_phone = t.find("#UPedit-phone").value,
        new_location = t.find("#UPedit-location").value,
        new_school = t.find('#UPedit-school').value,
        new_bus = $('.bus-selection input:checked').attr('value') || '',
        new_diet = [];
        
    $('.diet-selection input:checked').each(function() {
      new_diet.push(this.value);
    });

    if (Meteor.users.update({ "_id": Meteor.userId() }, {
        $set: {
          "profile.name": new_name,
          "profile.affiliation": new_affiliation,
          "profile.phone": new_phone,
          'profile.location': new_location,
          "profile.school": new_school,
          'profile.bus': new_bus,
          'profile.diet': new_diet
        }
    })) {
      // data save successfully
      Session.set("displayMessage", {
        title: "Success", 
        body: "Data saved successfully!"
      });
    }
    else {
      // data failed to save
      Session.set("displayMessage", {
        title: "Error", 
        body: 'Something went wrong saving the data! You may not have ' +
          'permission to perform this action.'
        });
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
