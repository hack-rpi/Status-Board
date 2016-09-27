// update database reactively instead of in modals
var devPost_link = '',
    new_devpost_link = '';
var devPost_dep = new Tracker.Dependency;
Tracker.autorun(function() {
  devPost_dep.depend();
  var sub = Meteor.subscribe("RepositoryList");
  if (sub.ready() && new_devpost_link) {
    if (isValidURL(new_devpost_link)) {
      RepositoryList.update({"_id": Meteor.user().profile.repositoryId}, {
        $set: {
          "DevPost": new_devpost_link
        }
      });
      devPost_link = new_devpost_link;
      $("#edit-DevPost-modal").modal("hide");
    } else {
      Forms.highlightError($("#devPost-input"), null);
    }
  }
});

var project_dep = new Tracker.Dependency;

var updateRepository = function(repoObj) {
  var repo_doc = RepositoryList.findOne({ 'full_name': repoObj.full_name });
  if (! repo_doc) {
    var repo_id = RepositoryList.insert({
      'name': repoObj.name,
      'full_name': repoObj.full_name,
      'owner': repoObj.owner_handle,
      'url': repoObj.url,
      'contributors': [],
      'webhook': {
        'created': false,
        'createdBy': ''
      },
      'DevPost': ''
    });
    repo_doc = RepositoryList.findOne({ '_id': repo_id });
  }
  Meteor.users.update({ "_id": Meteor.userId() }, {
      $set: {
        "profile.github_handle": repoObj.handle,
        "profile.repository": repo_doc.name,
        "profile.repositoryId": repo_doc._id
      }
  }, function(error) {
    if (! error) {
      RepositoryList.update({ "_id": repo_doc._id }, {
          $addToSet: {
            contributors: {
              id: Meteor.userId(),
              handle: repoObj.handle
            }
          }
      }, function(error2) {
        if (! error2) {
          Session.set("displayMessage", {
            title: "Success",
            body: "You have been successfully added to the project."});
        }
        else {
          Meteor.users.update({ "_id":Meteor.userId() }, {
            $set: {
              "profile.github_handle": "",
              "profile.repository": "",
              "profile.repositoryId": ""
            }
          });
          // data failed to save
          Session.set("displayMessage", {
            title: "Error",
            body: "Something went wrong saving the data! You may not have permission to perform this action."});
        }
        repoObj = {};
      });
    }
  });
};

Template.userHacker.rendered = function() {
  repo_sub = Meteor.subscribe("RepositoryList");
  userData_sub = Meteor.subscribe("userData");
}

var generateGetRepoInfo = function(field, onFail) {
  return function() {
    project_dep.depend();
    repo_sub = Meteor.subscribe('RepositoryList');
    if (repo_sub.ready()) {
      var repoDoc = RepositoryList.findOne({
        '_id': Meteor.user().profile.repositoryId
      });
      return repoDoc && repoDoc[field] ? repoDoc[field] : onFail;
    }
  };
};

Template.userHacker.helpers({
  pre_event: function() {
    return false;
  },
  handle: function() {
    project_dep.depend();
    return Meteor.user().profile.github_handle;
  },
  repository: function() {
    project_dep.depend();
    return Meteor.user().profile.repository;
  },
  repository_full: generateGetRepoInfo('full_name', ''),
  repository_url: generateGetRepoInfo('url', ''),
  devPost: generateGetRepoInfo('DevPost', ''),
  teamMembers: generateGetRepoInfo('contributors', []),
  warnDevPost: function() {
    project_dep.depend();
    repo_sub = Meteor.subscribe('RepositoryList');
    if (repo_sub.ready()) {
      var repoDoc = RepositoryList.findOne({
        '_id': Meteor.user().profile.repositoryId
      });
      if (repoDoc && repoDoc.devPost) {
        return 'btn-default';
      }
      else {
        return 'btn-warning';
      }
    }
  },
  hasWebhook: function() {
    project_dep.depend();
    repo_sub = Meteor.subscribe("RepositoryList");
    if (repo_sub.ready() &&
      RepositoryList.findOne({ '_id': Meteor.user().profile.repositoryId })) {
        return RepositoryList.findOne({
            '_id': Meteor.user().profile.repositoryId
          }).webhook.created;
      }
    else {
      return false;
    }
  },
});

Template.userHacker.events({
  'click #user-hacker-join-repo': () => {
    $('#user-hacker-alertbox').empty();
    const handle = $('#github-handle-input').val();
    let repoURL = $('#github-repo-input').val();
    let repoObj;
    let repo = '';
    let ownerHandle = '';
    try {
      if (!handle) {
        throw new Error('Github handle is required.');
      }
      if (!repoURL) {
        throw new Error('Repository URL is required.');
      }
      let i = 0;
      let URLArray = repoURL.split('/');
      while (i < URLArray.length && URLArray[i].toLowerCase() !== 'github.com') {
        i++;
      }
      if (i + 2 > URLArray.length) {
        throw new Error('Invalid Repository URL.');
      }
      URLArray = URLArray.slice(0, i + 3);
      repoURL = URLArray.join('/');
      Meteor.call('isValidUrl', repoURL, (error, result) => {
        if (!result) {
          $('<div>', {
            class: 'alert alert-danger alert-dismissible',
            text: 'Repository could not be found. The repository must be public.',
          }).append('<button type="button" class="close"' +
              'data-dismiss="alert" aria-hidden="true">&times;</button>')
                .appendTo('#user-hacker-alertbox');
        } else {
          ownerHandle = URLArray[i + 1];
          repo = URLArray[i + 2];
          repoObj = {
            handle,
            name: repo,
            owner: ownerHandle,
            full_name: `${ownerHandle}/${repo}`,
            url: repoURL,
          };
          updateRepository(repoObj);
          repoObj = {};
        }
      });
    } catch (errorString) {
      $('<div>', {
        class: 'alert alert-danger alert-dismissible',
        text: errorString,
      }).append('<button type="button" class="close"' +
          'data-dismiss="alert" aria-hidden="true">&times;</button>')
            .appendTo('#user-hacker-alertbox');
    }
  },
  'click #user-hacker-leave-repo': function() {
    if (!confirm("Are you sure want to leave this project?"))
      return false;
    Meteor.subscribe("userData");
    Meteor.subscribe("RepositoryList");
    var repo_id = Meteor.user().profile.repositoryId;
    var handle = Meteor.user().profile.github_handle;
    // delete their information in the repository entry
    RepositoryList.update({ "_id":repo_id }, {
      $pull: {
        contributors: {
          id: Meteor.userId(),
          handle: handle
        }
      }
    }, function(error, nUpdated) {
      if (!error) {
        // delete the information from the user's profile
        Meteor.users.update({ "_id":Meteor.userId() }, {
          $set: {
            "profile.github_handle": "",
            "profile.repository": "",
            "profile.repositoryId": ""
          }
        });
        var repo_doc = RepositoryList.findOne({ '_id': repo_id });
        if (Meteor.userId() === repo_doc.webhook.createdBy)
          Meteor.call('deleteRepositoryWebhook', Meteor.userId(), repo_doc);
        // delete the repository if they were the last person on the project
        RepositoryList.remove({ '_id': repo_id });
        }
      }
    );
  },
  'click #user-devPost-save': function() {
    new_devpost_link = $("#devPost-input").val();
    devPost_dep.changed();
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
