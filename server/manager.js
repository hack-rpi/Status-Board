if (Meteor.isServer) {

  Meteor.methods({
    'giveUpVote': function(commit_id, user_id) {
      var msg = CommitMessages.find({ _id:commit_id }).fetch()[0];
      var record = CommitMessages.find({ _id:commit_id, "flags.id":user_id }).fetch();
      // check if this user has flagged this commit before
      if (record.length != 0) {
        // # of votes must be less than 5
        var votes = 0;
        for (var i=0; i<record[0]["flags"].length; i++) {
          if (record[0]["flags"][i]["id"] == user_id) {
            votes = record[0]["flags"][i]["num"];
            break;
          }
        }
        if (votes < 5) {
          CommitMessages.update({ _id:commit_id }, {
            $inc: {total_flags: 1},
          });
          CommitMessages.update({ _id:commit_id, "flags.id":user_id }, {
            $inc: {"flags.$.num": 1}
          });
        } // otherwise no more votes are allowed
      }
      // if this is the first vote then we must initialize a few things
      else {
        CommitMessages.update({ _id:commit_id }, {
          $inc: {total_flags: 1},
          $push: {flags: {
            id:user_id,
            num: 1
            }
          }
        });
      }
    },

    'giveDownVote': function(commit_id, user_id) {
      var msg = CommitMessages.find({ _id:commit_id }).fetch()[0];
      var record = CommitMessages.find({ _id:commit_id, "flags.id":user_id }).fetch();
      // check if this user has flagged this commit before
      if (record.length != 0) {
        // # of votes must be less than 5
        var votes = 0;
        for (var i=0; i<record[0]["flags"].length; i++) {
          if (record[0]["flags"][i]["id"] == user_id) {
            votes = record[0]["flags"][i]["num"];
            break;
          }
        }
        if (votes > -5) {
          CommitMessages.update({ _id:commit_id }, {
            $inc: {total_flags: -1},
          });
          CommitMessages.update({ _id:commit_id, "flags.id":user_id }, {
            $inc: {"flags.$.num": -1}
          });
        } // otherwise no more votes are allowed
      }
      // if this is the first vote then we must initialize a few things
      else {
        CommitMessages.update({ _id:commit_id }, {
          $inc: {total_flags: -1},
          $push: {flags: {
            id:user_id,
            num: -1
            }
          }
        });
      }
    },

    'createNewUser': function(username, email, pass, real) {
      Accounts.createUser({
        'username': username,
        'email': email,
        'password': pass,
        'profile': {
          'name': real
        }
      });

      var newUser = Meteor.users.find( {username: username} ).fetch()[0];
      Roles.addUsersToRoles(newUser, "admin");
      return true;

    }

  });

}
