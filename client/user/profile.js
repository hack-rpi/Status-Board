Template.user_profile.rendered = function() {
  Meteor.subscribe("UserData");
}

Template.user_profile.helpers({
  email: function() {
    try {
      return Meteor.user().emails[0].address;
    }
    catch (e) {
      return '';
    }
  },
  name: function() {
    try {
      return Meteor.user().profile.name;
    }
    catch (e) {
      return '';
    }
  },
  affiliation: function() {
    try {
      return Meteor.user().profile.affiliation;
    }
    catch (e) {
      return '';
    }
  },
  phone: function() {
    try {
      return Meteor.user().profile.phone;
    }
    catch (e) {
      return '';
    }
  },
  location: function() {
    try {
      return Meteor.user().profile.location;
    }
    catch (e) {
      return '';
    }
  },
  school: function() {
    try {
      return Meteor.user().profile.school.name;
    }
    catch (e) {
      return '';
    }
  },
  travel_method: function() {
    try {
      return Meteor.user().profile.travel.method;
    }
    catch (e) {
      return '';
    }
  },
  diet: function() {
    try {
      return Meteor.user().profile.diet.list;
    }
    catch (e) {
      return [];
    }
  },
  resume: function() {
    try {
      return Meteor.user().profile.resume;
    }
    catch (e) {
      return '';
    }
  },
  international: function() {
    try {
      return Meteor.user().profile.travel.international;
    }
    catch (e) {
      return false;
    }
  },
  city_country: function() {
    try {
      return Meteor.user().profile.travel.location;
    }
    catch (e) {
      return '';
    }
  },
  zipcode: function() {
    try {
      return Meteor.user().profile.travel.zipcode;
    }
    catch (e) {
      return '';
    }
  },
  github: function() {
    try {
      return Meteor.user().profile.websites.github;
    }
    catch (e) {
      return '';
    }
  },
  linkedIn: function() {
    try {
      return Meteor.user().profile.websites.linkedIn;
    }
    catch (e) {
      return '';
    }
  },
  website: function() {
    try {
      return Meteor.user().profile.websites.personal;
    }
    catch (e) {
      return '';
    }
  },
  editActive: function() {
    user_profile_edit_dep.depend();
    return user_profile_edit;
  },
  allTravel: function() {
    try {
      return _.map(Meteor.settings.public.buses, function(route) {
        return {
          route: route,
          selected: Meteor.user().profile.travel.method === route
        }
      });
    } 
    catch (e) {
      Meteor.settings.public.buses;
    }
  },
  allDiets: function() {
    try {
      return _.map(Meteor.settings.public.diet, function(name) {
        return {
          name: name,
          selected: _.contains(Meteor.user().profile.diet.list, name)
        }
      });
    } 
    catch (e) {
      return Meteor.settings.public.diet;
    }
  },
  special_diet: function() {
    try {
      return Meteor.user().profile.diet.special;
    }
    catch (e) {
      return '';
    }
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
    var old_profile = Meteor.user().profile;

    var new_name = t.find("#UPedit-name").value,
        new_affiliation = t.find("#UPedit-affiliation").value,
        new_phone = t.find("#UPedit-phone").value,
        new_location = t.find("#UPedit-location").value,
        new_school = t.find('#UPedit-school').value,
        new_travel = $('.travel-selection input:checked').attr('value') || '',
        new_diet = [],
        new_special_diet = t.find('#UPedit-diet-special').value,
        new_github = t.find('#UPedit-github').value,
        new_linkedin = t.find('#UPedit-linkedIn').value,
        new_website = t.find('#UPedit-website').value,
        new_zipcode = null,
        new_city_country =  null;
        
    if (old_profile.travel.international) {
      new_city_country = t.find('#UPedit-city-country').value;
    }
    else {
      new_zipcode = t.find('#UPedit-zipcode').value;
    }
    
    $('.diet-selection input:checked').each(function() {
      new_diet.push(this.value);
    });

    if (Meteor.users.update({ "_id": Meteor.userId() }, {
        $set: {
          "profile.name": new_name,
          "profile.affiliation": new_affiliation,
          "profile.phone": new_phone,
          'profile.location': new_location,
          "profile.school.name": new_school,
          'profile.travel.method': new_travel,
          'profile.travel.zipcode': new_zipcode,
          'profile.travel.location': new_city_country,
          'profile.diet.list': new_diet,
          'profile.diet.special': new_special_diet,
          'profile.websites.github': new_github,
          'profile.websites.linkedIn': new_linkedin,
          'profile.websites.personal': new_website
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
