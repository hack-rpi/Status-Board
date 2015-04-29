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

var project_dep = new Tracker.Dependency;

var updateRepository = function(repo_obj) {
  var repo_doc = RepositoryList.findOne({ 'full_name': repo_obj.full_name });
  if (! repo_doc) {
    var repo_id = RepositoryList.insert({
      'name': repo_obj.name,
      'full_name': repo_obj.full_name,
      'owner': repo_obj.owner_handle,
      'url': repo_obj.url,
      'contributors': [],
      'userIds': [],
      'webhook': {
        'created': false,
        'createdBy': ''
      }
    });
    repo_doc = RepositoryList.findOne({ '_id': repo_id });
  }
  // update the user's profile
  if (Meteor.users.update({ "_id": Meteor.userId() }, {
      $set: {
        "profile.github_handle": repo_obj.handle,
        "profile.repository": repo_doc.name,
        "profile.repositoryId": repo_doc._id
      }
  }) && RepositoryList.update({ "_id": repo_doc._id }, {
      $addToSet: {
        "contributors": repo_obj.handle,
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
  repo_obj = {};
};

Template.user_hacker.rendered = function() {
  repo_sub = Meteor.subscribe("RepositoryList");
  userData_sub = Meteor.subscribe("userData");
}

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
    repo_sub = Meteor.subscribe("RepositoryList");
    if (repo_sub.ready() &&
      RepositoryList.findOne({"_id": Meteor.user().profile.repositoryId })) {
      return RepositoryList.findOne({"_id": Meteor.user().profile.repositoryId }).challengePost;
    }
    else {
      return "";
    }
  },
  teamMembers: function() {
    project_dep.depend();
    repo_sub = Meteor.subscribe("RepositoryList");
    if (repo_sub.ready() &&
      RepositoryList.findOne({"_id": Meteor.user().profile.repositoryId })) {
      return RepositoryList.findOne({"_id": Meteor.user().profile.repositoryId }).contributors;
    }
    else {
      return [];
    }
  },
  hasWebhook: function() {
    project_dep.depend();
    repo_sub = Meteor.subscribe("RepositoryList");
    if (repo_sub.ready() &&
      RepositoryList.findOne({ '_id': Meteor.user().profile.repositoryId })) {
        return ! RepositoryList.findOne({ '_id': Meteor.user().profile.repositoryId }).webhook.created;
      }
    else {
      return true;
    }
  }
});

Template.user_hacker.events({
  'click #user-hacker-join-repo': function() {
    // clear any old output messages
    $("#user-hacker-alertbox").empty();
    var handle = $('#github-handle-input').val(),
        repo_url = $('#github-repo-input').val(),
        repo_obj = {},
        repo = '',
        owner_handle = '';
    try {
      if (! handle)   throw "Github handle is required.";
      if (! repo_url) throw "Repository URL is required.";
      var i = 0,
          url_array = repo_url.split('/');
      while (i < url_array.length && url_array[i].toLowerCase() != 'github.com') i++;
      if (i+2 > url_array.length) throw "Invalid Repository URL.";
      Meteor.call('isValidUrl', repo_url, function(error, result) {
        if (! result) {
          $("<div>", {
            "class": "alert alert-danger alert-dismissible",
            text: 'Repository could not be found. The repository must be public.'
          }).append('<button type="button" class="close" \
              data-dismiss="alert" aria-hidden="true">&times;</button>').
                appendTo("#user-hacker-alertbox");
        }
        else {
          owner_handle = url_array[i+1];
          repo = url_array[i+2];
          repo_obj = {
            handle: handle,
            name: repo,
            owner: owner_handle,
            full_name: owner_handle + '/' + repo,
            url: repo_url
          };
          updateRepository(repo_obj);
          repo_obj = {};
        }
      });
    } catch (error_string) {
      $("<div>", {
        "class": "alert alert-danger alert-dismissible",
        text: error_string
      }).append('<button type="button" class="close" \
          data-dismiss="alert" aria-hidden="true">&times;</button>').
            appendTo("#user-hacker-alertbox");
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

  'click #github-signin': function() {
    Meteor.call('getGitHubRedirect', Meteor.userId(), function(error, result) {
      if (error) {
        Session.set('displayMessage', {
          title: error.error,
          body: error.reason
        });
      }
      else {
        window.location = result;
      }
    });
  },

});
