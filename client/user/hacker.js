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
