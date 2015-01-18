if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // create the necessary indexes here?
    // NOTE: The underscore before ensureIndex indicates that the function is
    //  undocumented by the Meteor Dev Group
    CommitMessages._ensureIndex( {"date" : -1} );
    CommitMessages._ensureIndex( {"sha" : 1} );
    Meteor.users._ensureIndex( {"username" : 1} );

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
    }, 60*1000);

    // check for responses from mentors to clear their statuses
    Meteor.setInterval(function() {
      Meteor.call("checkMentorResponses");
    }, 60*1000);

    // create the admin account with a default password
    if (Meteor.users.find( {username: config.admin_username} ).fetch().length == 0) {
      console.log(">> admin account created");
      Accounts.createUser({
        "username": config.admin_username,
        "password": config.admin_password,
        "profile": {
          "name": "Administrator"
        }
      });

      // give the admin admin rights
      var adminUser = Meteor.users.find( {username: config.admin_username} ).fetch()[0];
      Roles.addUsersToRoles(adminUser, ["super","admin","flagger","mentor","announcer","manager"]);
    }


    // Prevent non-authorized users from creating new users:
    Accounts.validateNewUser(function (user) {
      var loggedInUser = Meteor.user();

      if (Roles.userIsInRole(loggedInUser, 'admin')) {
        return true;
      }

      throw new Meteor.Error(403, "Not authorized to create new users");
    });

    // publish the databases to all clients
    Meteor.publish("CommitMessages", function() { return CommitMessages.find(); });
    Meteor.publish("RepositoryList", function() { return RepositoryList.find(); });
    Meteor.publish("Announcements", function() {  return Announcements.find(); });
    Meteor.publish("Mentors", function() {        return Mentors.find(); });
    Meteor.publish("MentorQueue", function() {    return MentorQueue.find(); });
    Meteor.publish("userData", function() {
      return Meteor.users.find({});
    });
    Meteor.publish("userRoles", function  () {
      return Roles.getAllRoles();
    });

    // COLLECTION PRIVELEDGES
    Meteor.users.allow({
      insert:function() {
        if (Roles.userIsInRole(Meteor.user(), 'admin'))
          return true;
      },
      remove:function() {
        if (Roles.userIsInRole(Meteor.user(), 'admin'))
          return true;
      },
      update:function() {
        if (Roles.userIsInRole(Meteor.user(), 'admin'))
          return true;
      }
    });
    CommitMessages.allow({
      insert:function() {
        if (Roles.userIsInRole(Meteor.user(), 'flagger'))
          return true;
      },
      remove:function() {
        if (Roles.userIsInRole(Meteor.user(), 'flagger'))
          return true;
      },
      update:function() {
        if (Roles.userIsInRole(Meteor.user(), 'flagger'))
          return true;
      }
    });
    RepositoryList.allow({
      insert:function() {
        return true;
      },
      remove:function() {
        if (Roles.userIsInRole(Meteor.user(), 'admin'))
          return true;
      },
      update:function() {
        if (Roles.userIsInRole(Meteor.user(), 'admin'))
          return true;
      }
    });
    Announcements.allow({
      insert:function() {
        if (Roles.userIsInRole(Meteor.user(), 'announcer'))
          return true;
      },
      remove:function() {
        if (Roles.userIsInRole(Meteor.user(), 'announcer'))
          return true;
      },
      update:function() {
        if (Roles.userIsInRole(Meteor.user(), 'announcer'))
          return true;
      }
    })
    Mentors.allow({
      insert:function() {
        if (Roles.userIsInRole(Meteor.user(), 'mentor'))
          return true;
      },
      remove:function() {
        if (Roles.userIsInRole(Meteor.user(), 'mentor'))
          return true;
      },
      update:function() {
        if (Roles.userIsInRole(Meteor.user(), 'mentor'))
          return true;
      }
    });
    MentorQueue.allow({
      insert:function() {
        return true;
      },
      remove:function() {
        if (Roles.userIsInRole(Meteor.user(), 'mentor'))
          return true;
      },
      update:function() {
        if (Roles.userIsInRole(Meteor.user(), 'mentor'))
          return true;
      }
    });


  });

  Meteor.methods({
    getCommit: function(username, repo) {
      var token = config.github_API_token;
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
            var v_date = Meteor.call('validateDate', data[i]['commit']['committer']['date']);
            CommitMessages.insert({
              sha : commit_sha,
              text : data[i]['commit']['message'],
              date : v_date,
              fdate :  Meteor.call('formatDateTime', v_date),
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

    validateDate: function(dt) {
      // if a commit has a date in the future compared to the server time, then
      //  assign it the server time
      var now = new Date();
      now.setHours( now.getHours() + 5 ); // UTC
      if (dt > now) {
        dt = now;
      }
      return dt;
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
            Announcements.remove({_id:msgs[i]._id});
        }
        else {
          // check if it's time to show this announcement
          if (d > msgs[i].startTime)
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

      var mentors = Mentors.find({ status:true }).fetch();

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
          $set: { available:false, status:false }
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

    sendText: function(toNum, msg) {
      var SID = config.twilio_SID;
      var token = config.twilio_token;
      var url = "https://api.twilio.com/2010-04-01/Accounts/" + config.twilio_SID + "/SMS/Messages.json"
      var fromNum = config.twilio_from_num;
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

    retrieveMessages: function() {
      var SID = config.twilio_SID;
      var token = config.twilio_token;
      var url = "https://api.twilio.com/2010-04-01/Accounts/" + config.twilio_SID + "/SMS/Messages.json"
      var fromNum = config.twilio_from_num;

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

    checkMentorResponses: function() {
      var msgs = Meteor.call("retrieveMessages");
      if (!msgs)
        return;

      var texts = msgs.data.sms_messages;
      var now = new Date();
      var past = new Date(now.getTime() - 60000); // Date object 60 seconds in the past

      for (var t=0; t<texts.length; t++) {
        // since this function is called every 60 seconds, only look at the messages
        // from the last 60 seconds
        var t_date = new Date(texts[t].date_sent.substring(0,26));
        t_date = new Date(t_date.getTime() - 5*60*60000); // timezone offset

        if (past > t_date)
          break;

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

      } // end for
    }


  });
}
