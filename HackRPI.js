CommitMessages = new Meteor.Collection("CommitMessages");
RepositoryList = new Meteor.Collection("RepositoryList");


if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to HackRPI.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')

        Meteor.call("refreshCommitsAllRepos");

      }
  });

  Template.commits.message = function() {
    return CommitMessages.find();
  };

  Template.repos.events({
    'click #addRepoBtn': function() {
      var username = $('#inputUsername').val();
      var repo = $('#inputRepo').val();
      // var username = "mpoegel";
      // var repo = "Blockzzzzzz";
      // first check if already in database
      if (RepositoryList.find({ name: repo }).fetch().length != 0) {
        console.log("repo already exists");
        return;
      }
      // then check if the repo is valid (exists on github)
      // this has to be asynchronous! (idk why it just does)
      Meteor.call("getCommit", username, repo, function(error, result) {
        if (!result) {
          console.log("not a valid repo");
          return;
        }
        // if all good, then go ahead and add it to the database
        RepositoryList.insert({
          name: repo,
          owner: username
        });
        console.log("repo added successfully");
      });
    }
  });

  Template.repos.names = function() {
    return RepositoryList.find();
  };

}

// =============================================================================

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // refresh the commit database every 30 seconds
    Meteor.setInterval(function() {
      Meteor.call("refreshCommitsAllRepos");
    }, 30*1000);

  });

  Meteor.methods({
    getCommit: function(username, repo) {
      var token = ***REMOVED***;
      var url = "https://api.github.com/repos/" + username + "/" + repo + "/commits";
      try {
        return Meteor.http.get(url, {
          headers: {
            "User-Agent": "Meteor/1.0"
          },
          params: {
            access_token: token
          }
        });
      }
      catch(err) {
        console.log("github api failed");
        return false;
      }
    },

    addCommits: function(username, repo) {
      // make a synchronous call (blocking)
      var result = Meteor.call('getCommit', username, repo);
      if (result.statusCode != 200) {
        console.log("ERROR connecting to Github API");
      }
      else {
        var data = JSON.parse(result.content);
        // loop over all the commits that were found
        // STOP if we get to something we've already added
        for (var i=0; i<data.length; i++) {
          // get sha and check if it's already in the database
          var commit_sha = data[i]['sha'];
          // check if this commit is already added to the db
          if ( CommitMessages.find({ sha: commit_sha }).fetch().length != 0 ) {
            // all of the rest will not be new either so stop here
            break;
          }
          // if this sha doesn't already exist in the database then it is new
          else {
            // capture and store all of the data
            CommitMessages.insert({
              sha : commit_sha,
              text : data[i]['commit']['message'],
              date : data[i]['commit']['committer']['email'],
              committer_handle : data[i]['committer'] ? data[i]['committer']['login'] : data[i]['commit']['committer']['name'],
              committer_avatar : data[i]['committer'] ? data[i]['committer']['avatar_url']: null,
              committer_real : data[i]['commit']['committer']['name'],
              // probably not a good a idea to store emails?
              // (do I have access to all of them?)
              committer_email : data[i]['commit']['committer']['email']
            });
          }
        }
      }
    },


    refreshCommitsAllRepos: function() {
      // loop over all the repos in the database and check for new commit messages
      var stored_repos = RepositoryList.find().fetch();
      for (var i=0; i<stored_repos.length; i++) {
        var owner = stored_repos[i]["owner"];
        var name = stored_repos[i]["name"];
        Meteor.call("addCommits", owner, name);
      }
    }


  });
}
