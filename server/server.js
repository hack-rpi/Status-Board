if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // refresh the commit database every 30 seconds
    Meteor.setInterval(function() {
      Meteor.call("refreshCommitsAllRepos");
    }, 60*1000);

    // show check for new announcements to show every 30 seconds
    Meteor.setInterval(function() {
      Meteor.call("showAnnouncements");
    }, 10*1000);

    // assign free mentors to hackers in the queue every 60 seconds
    Meteor.setInterval(function() {
      Meteor.call("assignMentors");
    }, 10*1000);

    Meteor.setInterval(function() {
      Meteor.call("checkMentorResponses");
    }, 10*1000);

    // create the admin account with a default password
    if (Meteor.users.find( {username: "admin"} ).fetch().length == 0) {
      console.log(">> admin account created");
      Accounts.createUser({
        "username": "admin",
        "password": "admin",
        "profile": {
          "name": "Administrator"
        }
      });

      // give the admin admin rights
      var adminUser = Meteor.users.find( {username: 'admin'} ).fetch()[0];
      Roles.addUsersToRoles(adminUser, ["super","admin"]);
    }


    // Prevent non-authorized users from creating new users:
    // Accounts.validateNewUser(function (user) {
    //   var loggedInUser = Meteor.user();
    //
    //   if (Roles.userIsInRole(loggedInUser, 'admin')) {
    //     return true;
    //   }
    //
    //   throw new Meteor.Error(403, "Not authorized to create new users");
    // });

    // publish the databases to all clients
    Meteor.publish("CommitMessages", function() { return CommitMessages.find(); });
    Meteor.publish("RepositoryList", function() { return RepositoryList.find(); });
    Meteor.publish("Announcements", function() {  return Announcements.find(); });
    Meteor.publish("Mentors", function() {        return Mentors.find(); });
    Meteor.publish("MentorQueue", function() {    return MentorQueue.find(); });
    Meteor.publish("userData", function() {
      return Meteor.users.find({});
    });

    Meteor.users.allow({ remove:function() {
      return true;
    }});
    Meteor.users.allow({ update:function() {
      return true;
    }});

  });

  Meteor.methods({
    getCommit: function(username, repo) {
      var token = "ea86855a004a03c2a72c3a7c95ef6a5f05b5dce4";
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
              committer_email : data[i]['commit']['committer']['email'],
              flags: [],
              total_flags: 0
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
      hour -= 5; // timezone difference

      var d = new Date(year,month,day,hour,min,sec);
      d = d.toLocaleString(0,24);

      return d.substr(0,24);
    },

    showAnnouncements: function() {
      // use this to update which announcements should be visible
      var msgs = Announcements.find().fetch();
      for (var i=0; i<msgs.length; i++) {
        var d = new Date(); // current time
        if (msgs[i].visible) {
          // check if the time is up on this announcement
          if (d > msgs[i].endTime)
            Announcements.update({_id:msgs[i]._id},
              {$set: {visible:false}});
        }
        else {
          // check if it's time to show this announcement
          if (d < msgs[i].startTime)
            Announcements.update({_id:msgs[i]._id},
              {$set: {visible:true}});
        }
      }
    },

    assignMentors: function() {
      // loop over the queue sorted by oldest to most recent
      // console.log("assigning mentors...");

      var reqs = MentorQueue.find().fetch();
      var Q = reqs.sort(function(a,b) { return a.timestamp < b.timestamp; } );

      var mentors = Mentors.find({ $and: [ {available:true}, {suspended:false} ] }).fetch();

      // console.log("Mentors available: ", mentors.length);

      // bail if there are no available mentors
      if (mentors.length == 0)
        return;

      // we can either wait for the best fit mentor to be available, or just
      // go with the next available mentor who best fits the person's needs
      // >> Let's go with the latter
      for (var i=0; i<Q.length; i++) {
        // refresh this everytime
        mentors = Mentors.find({ status:true }).fetch();
        if (mentors.length == 0)
          return;

        var most_matches = 0;
        var most_matched_tags = [];
        var most_id = "";
        var h_tags = Q[i]["tags"]
        // loop over the available mentors
        for (var m=0; m<mentors.length; m++) {
          // check the matchness of this mentor
          var m_tags = mentors[m]["tags"];
          var matched_tags = [];
          var matches = 0;
          for (var k=0; k<h_tags.length; k++) {
            for (var n=0; n<m_tags.length; n++) {
              if (h_tags[k] == m_tags[n]) {
                matched_tags.push(h_tags[k]);
                matches++;
              }
            }
          }
          if (matches > most_matches) {
            most_matches = matches;
            most_matched_tags = matched_tags;
            most_id = mentors[m]["_id"];
          }
          // if we match all the tags then no sense in looking further!
          if (most_matches == h_tags.length)
            break;
        } // end mentor loop

        // if we couldn't find an available mentor for this person then skip him
        if (most_id == "")
          break;

        var matched_mentor = Mentors.find({ _id:most_id }).fetch()[0];
        // console.log("found a match for hacker ", Q[i]["name"], " with ", matched_mentor["name"]);


        // otherwise we found a mentor
        // now we assign the mentor to the hacker
        // send a text to the mentor to tell them where to go
        var s = "";
        for (var t=0; t<most_matched_tags.length && t<3; t++) {
          s += most_matched_tags[t];
          if (t < 2 && t != most_matched_tags.length-1)
            s += " and";
          else if (t == 2 && most_matched_tags.length > 3)
            s += " and more";
        }
        var msg = Q[i].name + " needs your help with " + s + "!" + " S/he can be found at " + Q[i].loc;
        Meteor.call("sendText", matched_mentor.phone, msg);

        // mark the mentor as busy
        Mentors.update({ _id:most_id }, {
          $set: { available:false }
        });

        // send a text to the hacker to tell them that a mentor is on his way
        if (Q[i].phone != "") {
          msg = matched_mentor.name + " from " + matched_mentor.company + " is on his way to assist you!";
          Meteor.call("sendText", Q[i].phone, msg);
        }

        // remove the hacker from the queue
        MentorQueue.remove({ _id:Q[i]._id });

        // aaaaand ya done

      } // end Q loop

    },

    'sendText': function(toNum, msg) {
      var SID = "ACb634fe7d4a0567241ccf7c7ca3d8fd61";
      var token = "15657581d0b6ad1b74edd342fad349c8";
      var url = "https://api.twilio.com/2010-04-01/Accounts/ACb634fe7d4a0567241ccf7c7ca3d8fd61/SMS/Messages.json"
      var fromNum = "+18556780758";
      toNum = toNum.replace("-","");

      try {
        return Meteor.http.post(url, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          auth: SID + ":" + token,
          params: {
            From: fromNum,
            To: "+1" + toNum,
            Body: msg
          }
        });
      }
      catch(err) {
        console.log('Twilio API Error!');
        console.log(err);
        return false;
      }
    },

    'retrieveMessages': function() {
      var SID = "ACb634fe7d4a0567241ccf7c7ca3d8fd61";
      var token = "15657581d0b6ad1b74edd342fad349c8";
      var url = "https://api.twilio.com/2010-04-01/Accounts/ACb634fe7d4a0567241ccf7c7ca3d8fd61/SMS/Messages.json"
      var fromNum = "+18556780758";

      try {
        return Meteor.http.get(url, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          auth: SID + ":" + token
        });
      }
      catch(err) {
        console.log('Twilio API Error!');
        console.log(err);
        return false;
      }
    },

    'checkMentorResponses': function() {
      var msgs = Meteor.call("retrieveMessages");
      var texts = msgs.data.sms_messages;
      // this only gets back 50 messages so I'm not going to bother stopping
      // the loop early (oh well I'll do it later or something)
      for (var t=0; t<texts.length; t++) {
        if (texts[t].direction == "inbound") {
          var m = texts[t].body.toUpperCase();
          var p = texts[t].from;
          p = p.substring(2,5) + "-" + p.substring(5,8) + "-" + p.substring(8);
          if (m == "DONE") {
            Mentors.update({ phone:p }, {
              $set: {available:true}
            });
          }
        }
      }
    }


  });
}
