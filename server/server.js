if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // refresh the commit database every 30 seconds
    Meteor.setInterval(function() {
      Meteor.call("refreshCommitsAllRepos");
    }, 30*1000);

    // create the admin account with a default password
    if (!Meteor.users.find( {username: ***REMOVED***} )) {
      Accounts.createUser({
        "_id": "1234",
        "username": ***REMOVED***,
        "email": "poegem@rpi.edu",
        "password": ***REMOVED***,
        "profile": {
          "name": "Matt Poegel"
        }
      });

      // give the admin admin rights
      Roles.addUsersToRoles("1234", ***REMOVED***);
    }


    // Prevent non-authorized users from creating new users:
    Accounts.validateNewUser(function (user) {
      var loggedInUser = Meteor.user();

      if (Roles.userIsInRole(loggedInUser, 'admin')) {
        return true;
      }

      throw new Meteor.Error(403, "Not authorized to create new users");
    });

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
            // sometimes the 'committer' field is null... not sure why
            //  but we have to check everytime if it is
            CommitMessages.insert({
              sha : commit_sha,
              text : data[i]['commit']['message'],
              date : data[i]['commit']['committer']['date'],
              fdate :  Meteor.call('formatDateTime', data[i]['commit']['committer']['date']),
              repo: repo,
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
    },

    formatDateTime: function(dt) {
      var year  = parseInt(dt.substr(0,4),10);
      var month = parseInt(dt.substr(5,2),10);
      var day   = parseInt(dt.substr(8,2),10);
      var hour  = parseInt(dt.substr(11,2),10);
      var min   = parseInt(dt.substr(14,2),10);
      var sec   = parseInt(dt.substr(17,2),10);
      month--; // JS months start at 0

      var d = new Date(year,month,day,hour,min,sec);
      d = d.toLocaleString(0,24);

      return d.substr(0,24);
    }


  });
}
