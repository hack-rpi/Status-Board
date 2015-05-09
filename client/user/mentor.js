var edit_skills_flag = false,
    edit_skills_dep  = new Tracker.Dependency;

Template.user_mentor.helpers({
  active: function() {
    // return the status of the mentor
    return Meteor.user().profile.active;
  },
  assignment: function() {
    // returns the details of the mentor's current assignment
    Meteor.subscribe("MentorQueue");
    if (Meteor.user().profile.mentee_id)
      return MentorQueue.find({
        '_id': Meteor.user().profile.mentee_id
      });
    else return false;
  },
  skills: function() {
    // returns the mentor's list of skills
    var arr = [];
    Meteor.user().profile.tags.forEach(function(val) {
      arr.push(val);
    });
    return arr;
  },
  history: function() {
    // returns a list of the mentor's past assignments
    return Meteor.user().profile.history;
  },
  editSkills: function() {
    // toggle editting the mentor's skills
    edit_skills_dep.depend();
    return edit_skills_flag;
  },
  modifyLangs: function() {
    // return a list of the mentor's languages with the selected ones marked
    var all = [];
    Meteor.settings.public.languages.forEach(function(lang) {
      all.push({
        name: lang,
        checked: $.inArray(lang, Meteor.user().profile.languages) != -1 });
    });
    return all;
  },
  modifyFrames: function() {
    // return a list of the mentor's frameworks with the selected ones marked
    var all = [];
    Meteor.settings.public.frameworks.forEach(function(frame) {
      all.push({
        name: frame,
        checked: $.inArray(frame, Meteor.user().profile.frameworks) != -1 });
    });
    return all;
  },
  modifyApis: function() {
    // return a list of the mentor's APIs with the selected ones marked
    var all = [];
    Meteor.settings.public.apis.forEach(function(api) {
      all.push({
        name: api,
        checked: $.inArray(api, Meteor.user().profile.apis) != -1 });
    });
    return all;
  }
});

Template.user_mentor.events({
  'click #suspend-mentor-btn': function() {
    // toggle the mentor as unactive
    Meteor.users.update({ '_id':Meteor.userId() }, {
      $set: { 'profile.active': false }
    });
  },
  'click #active-mentor-btn': function() {
    // toggle the mentor as active
    Meteor.users.update({ '_id':Meteor.userId() }, {
      $set: { 'profile.active': true }
    });
  },
  'click #user-mentor-edit-skills-btn': function() {
    // toggle editting the mentor's skills
    edit_skills_flag = !edit_skills_flag;
    edit_skills_dep.changed();
  },
  'click #user-mentor-save-skills-btn': function() {
    // save all changes made the selected skills
    Meteor.subscribe("userData");
    var languages = [],
        frameworks = [],
        apis = [],
        all = [];
    $("#user-mentor-checkbox-langs input:checked").each(function() {
      languages.push(this.name); all.push(this.name);
    });
    $("#user-mentor-checkbox-frames input:checked").each(function() {
      frameworks.push(this.name); all.push(this.name);
    });
    $("#user-mentor-checkbox-apis input:checkbox").each(function() {
      apis.push(this.name); all.push(this.name);
    });
    if (Meteor.users.update({ '_id': Meteor.userId() }, {
      $set: {
        'profile.languages': languages,
        'profile.frameworks': frameworks,
        'profile.apis': apis,
        'profile.tags': all
      }
    })) {
      Session.set("displayMessage", {
        title: 'Success',
        body: 'Data saved successfully'
      });
      edit_skills_flag = false;
      edit_skills_dep.changed();
    }
    else {
      Session.set("displayMessage", {
        title: "Error",
        body: "Something went wrong trying to save your changes. Please try again later!"
      });
    }
  },
  'click #user-mentor-complete-task-btn': function() {
    // complete the mentor's current assignment
    var mentee_id = Meteor.user().profile.mentee_id;
    Meteor.subscribe("MentorQueue");
    var mentee = MentorQueue.findOne({ "_id": mentee_id });
    Meteor.users.update({ "_id": Meteor.userId() }, {
      $set: {
        "profile.available": true,
        "profile.mentee_id": null
      },
      $push: {
        "profile.history": {
          "name": mentee.name,
          "_id": mentee_id,
          "tag": mentee.tag,
          "loc": mentee.loc,
          "time": (new Date()).toLocaleString()
        }
      }
    });

  },
  'click #user-mentor-waive-task-btn': function() {
    // return the current task back to the queue to be assigned to someone
    //   else (nothing preventing self re-assignment!)
    Meteor.subscribe("MentorQueue");
    var mentee_doc = MentorQueue.findOne({'_id': Meteor.user().profile.mentee_id });
    MentorQueue.update({ '_id': mentee_doc._id }, {
      $set: { 'completed': false }
    }, function(error, result) {
      if (mentee_doc.phone) {
        Meteor.call('sendText', mentee_doc.phone, Meteor.user().profile.name +
          ' was called away. You have been added back into the queue.');
      }
    });
    Meteor.users.update({ '_id': Meteor.userId() }, {
      $set: {
        'profile.available': true,
        'profile.active': false,
        'profile.mentee_id': null,
      }
    });
  },
});
