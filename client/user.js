if (Meteor.isClient) {

  Template.user.rendered = function() {
    Session.set("active-page", "nav-user");
    Session.set("user-page", "user-profile-btn");
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
// USER PROFILE

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

  // ===========================================================================
  // USER SETTINGS

  // ===========================================================================
  // USER HACKER

  // update database reactively instead of in modals
  var challengePost_link = "";
  var challengePost_dep = new Tracker.Dependency;
  Tracker.autorun(function() {
    challengePost_dep.depend();
    var sub = Meteor.subscribe("RepositoryList");
    if (sub.ready() && challengePost_link) {
      RepositoryList.update({"_id": Meteor.user().profile.repositoryId}, {
        $set: {
          "challengePost": challengePost_link
        }
      });
    }
  });

  var add_new_repo_flag = 0;
  var add_new_repo_dep = new Tracker.Dependency;
  var repo_add_owner_handle = null;
  var repo_add_handle = null;
  var repo_add_repo_name = null;
  var repo_add_dep = new Tracker.Dependency;
  var project_dep = new Tracker.Dependency;

  var linkUserToRepo = function(handle, repo_doc) {
    // RepositoryList DB is only ready if called a second time?!
    Meteor.subscribe("userData");
    Meteor.subscribe("RepositoryList");
    if (Meteor.users.update({ "_id": Meteor.userId() }, {
        $set: {
          "profile.github_handle": handle,
          "profile.repository": repo_doc.name,
          "profile.repositoryId": repo_doc._id
        }
    }) && RepositoryList.update({ "_id": repo_doc._id }, {
        $addToSet: {
          "contributors": handle,
          "userIds": Meteor.userId()
        }
    })) {
      // success
      Session.set("displayMessage", {
        title: "Success",
        body: "You have been successfully added to the project."});
    }
    else {
      // data failed to save
      Session.set("displayMessage", {
        title: "Error",
        body: "Something went wrong saving the data! You may not have permission to perform this action."});
    }
  }

  Tracker.autorun(function() {
    repo_add_dep.depend();
    Meteor.subscribe("RepositoryList");
    if (add_new_repo_flag && repo_add_owner_handle) {
      // check if the repo is valid (exists on github)
      // this has to be asynchronous
      Meteor.call("getCommit", repo_add_owner_handle, repo_add_repo_name, function(error, result) {
        if (!result) {
          $("<div>", {
            "class": "alert alert-warning alert-dismissible",
            text: "This repository cannot be found on GitHub! Are you sure the repository is public?"
          }).append('<button type="button" class="close" \
              data-dismiss="alert" aria-hidden="true">&times;</button>').
                appendTo("#user-hacker-alertbox");
          return false;
        }
        contributors = [repo_add_owner_handle];
        userIds = [Meteor.userId()];
        // if all good, then go ahead and add it to the database
        RepositoryList.insert({
          'name': repo_add_repo_name,
          'owner': repo_add_owner_handle,
          'contributors': contributors,
          'userIds': userIds
        });
        var repo_doc = RepositoryList.findOne({ "name":repo_add_repo_name });
        $("#join-repo-modal").modal("hide");
        add_new_repo_flag = false;
        add_new_repo_dep.changed();
        // update the user's profile
        linkUserToRepo(repo_add_handle, repo_doc);
      });
    }
    else if (repo_add_repo_name && repo_add_handle) {
      var repo_doc = RepositoryList.findOne({ "name":repo_add_repo_name });
      if (repo_doc) {
        // found repository in the database so just connect the current user
        $("#join-repo-modal").modal("hide");
        linkUserToRepo(repo_add_handle, repo_doc);
      }
      else {
        // existing repository not found
        add_new_repo_flag = true;
        add_new_repo_dep.changed();
        return false;
      }
    }
  });

  Template.user_hacker.helpers({
    handle: function() {
      project_dep.depend();
      return Meteor.user().profile.github_handle;
    },
    repository: function() {
      project_dep.depend();
      return Meteor.user().profile.repository;
    },
    challengePost: function() {
      project_dep.depend();
      var sub = Meteor.subscribe("RepositoryList");
      if (sub.ready()) {
        return RepositoryList.findOne({"_id": Meteor.user().profile.repositoryId }).challengePost;
      }
      else {
        return "";
      }
    },
    teamMembers: function() {
      project_dep.depend();
      var sub = Meteor.subscribe("RepositoryList");
      if (sub.ready())
        return RepositoryList.findOne({"_id": Meteor.user().profile.repositoryId }).contributors;
      else
        return [];
    },
    add_new_repo: function() {
      add_new_repo_dep.depend();
      return add_new_repo_flag;
    },
  });

  Template.user_hacker.events({
    'click #user-hacker-join-repo': function() {
      // clear any old output messages
      $("#user-hacker-alertbox").empty();
      var handle = $('#github-handle-input').val();
      var repo = $('#github-repo-input').val();
      var owner_handle = $('#github-repo-owner-input').val();

      if (handle == "" || repo == "") {
        $("<div>", {
          "class": "alert alert-danger alert-dismissible",
          text: "All fields are required."
        }).append('<button type="button" class="close" \
            data-dismiss="alert" aria-hidden="true">&times;</button>').
              appendTo("#user-hacker-alertbox");
        return false;
      }
      else {
        repo_add_handle = handle;
        repo_add_repo_name = repo;
        repo_add_owner_handle = owner_handle;
        repo_add_dep.changed();
      }

    },
    'click #user-hacker-leave-repo': function() {
      if (!confirm("Are you sure want to leave this project?"))
        return false;
      Meteor.subscribe("userData");
      Meteor.subscribe("RepositoryList");
      var repo_id = Meteor.user().profile.repositoryId;
      var handle = Meteor.user().profile.github_handle;
      // delete the information from the user's profile
      Meteor.users.update({ "_id":Meteor.userId() }, {
        $set: {
          "profile.github_handle": "",
          "profile.repository": "",
          "profile.repositoryId": ""
        }
      });
      // delete their information in the repository entry
      RepositoryList.update({ "_id":repo_id }, {
        $pull: {
          "contributors": handle,
          "userIds": Meteor.userId()
        }
      });
      // delete the repository if they were the last person on the project
      if (RepositoryList.find({ "_id":repo_id }).fetch()[0].contributors.length == 0) {
        RepositoryList.remove({ "_id": repo_id });
      }
    },
    'click #user-challengePost-save': function() {
      challengePost_link = $("#challengePost-input").val();
      challengePost_dep.changed();
      $("#edit-ChallengePost-modal").modal("hide");
    },
  });

  // ===========================================================================
  // USER MENTOR
  var edit_skills_flag = false,
      edit_skills_dep  = new Tracker.Dependency;

  Template.user_mentor.helpers({
    active: function() {
      // return the status of the mentor
      return Meteor.user().profile.active;
    },
    assignment: function() {
      // returns the details of the mentor's current assignment
      return false;
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
      return [];
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
    }
  });

  // ===========================================================================
  // USER SERVER SETTINGS

  Template.user_server_settings.helpers({
    allowAccountCreation: function() {
      Meteor.subscribe("userData");
      return Meteor.user().profile.settings.allow_account_creation;
    },
    mentoringSystemStatus: function() {
      Meteor.subscribe("userData")
      return Meteor.user().profile.settings.mentoring_system;
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
  })

}
