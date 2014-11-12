if (Meteor.isClient) {

  Template.manage.events({
    'click #showCommits': function() {
      $('#m_commits').addClass('hidden');
      $('#m_announcements').addClass('hidden');
      $('#m_repos').addClass('hidden');
      $('#m_mentors').addClass('hidden');
      $('#m_users').addClass('hidden');
      $('#m_commits').toggleClass("hidden");
    },
    'click #showAnnouncements': function() {
      $('#m_commits').addClass('hidden');
      $('#m_announcements').addClass('hidden');
      $('#m_repos').addClass('hidden');
      $('#m_mentors').addClass('hidden');
      $('#m_users').addClass('hidden');
      $('#m_announcements').toggleClass("hidden");
    },
    'click #showRepos': function() {
      $('#m_commits').addClass('hidden');
      $('#m_announcements').addClass('hidden');
      $('#m_repos').addClass('hidden');
      $('#m_mentors').addClass('hidden');
      $('#m_users').addClass('hidden');
      $('#m_repos').toggleClass("hidden");
    },
    'click #showMentors': function() {
      $('#m_commits').addClass('hidden');
      $('#m_announcements').addClass('hidden');
      $('#m_repos').addClass('hidden');
      $('#m_mentors').addClass('hidden');
      $('#m_users').addClass('hidden');
      $('#m_mentors').toggleClass("hidden");
    },
    'click #showUsers': function() {
      $('#m_commits').addClass('hidden');
      $('#m_announcements').addClass('hidden');
      $('#m_repos').addClass('hidden');
      $('#m_mentors').addClass('hidden');
      $('#m_users').addClass('hidden');
      $('#m_users').toggleClass("hidden");
    }
  });


  Template.m_commits.helpers({
    commits: function() {
      Meteor.subscribe("CommitMessages");
      return CommitMessages.find({}, {sort: {date:-1}, limit:10});
    },
    bestCommits: function() {
      Meteor.subscribe("CommitMessages");
      return CommitMessages.find({}, {sort: {total_flags:-1}, limit:5});
    }
  });

  Template.m_commits.events({
    'click .upVoteCommit': function() {
      var user_id = Meteor.user()._id;
      var commit_id = this._id;
      Meteor.call("giveUpVote", commit_id, user_id);
    },

    'click .downVoteCommit': function() {
      var user_id = Meteor.user()._id;
      var commit_id = this._id;
      Meteor.call("giveDownVote", commit_id, user_id);
    }
  });


  Template.announcements.helpers({
    activeAnnouncements: function() {
      Meteor.subscribe("Announcements");
      return Announcements.find();
    }
  });


  Template.announcements.events({
    'click #addAnnouncementBtn': function() {
      var header = $('#inputHeader').val();
      var body = $('#inputBody').val();
      var startNow = $('input[name="announcementStart"]:checked').length > 0;
      var startTime = $('#inputStartTime').val();
      var duration = $('#inputDuration').val();
      var visible = false;

      if (startNow) {
        startTime = new Date(); // now
        visible = true;
      }
      else {
        startTime = new Date(startTime+":00");
        startTime = new Date(startTime.getTime() + 5*60*60000); // timezone offset
      }

      var endTime = new Date(startTime.getTime() + duration*60000);

      Announcements.insert({
        header: header,
        text: body,
        startTime: startTime,
        endTime: endTime,
        visible: visible
      });

      $("#announcementAlertBox").empty();
      $("<div>", {
        "class": "alert alert-success alert-dismissible",
        text: "Announcements Added"
      }).append('<button type="button" \
        class="close" data-dismiss="alert" \
        aria-hidden="true">&times;</button>').appendTo("#announcementAlertBox");
    },

    'click .removeAnnouncement': function() {
      Meteor.subscribe("Announcements");
      if (confirm("Remove this announcement?")) {
        Announcements.remove({ _id:this._id })
      }
    }

  });


  Template.m_repos.helpers({
    repo: function() {
      var query = $("#inputRepoSearch").val();
      console.log(query);
      Meteor.subscribe("RepositoryList");
      return RepositoryList.find({  });
    }
  });


  Template.m_repos.events({
    'click .removeRepo': function() {
      if (confirm("Delete this repository?")) {
        // delete all commit messages associated with this repo
        Meteor.subscribe("RepositoryList");
        var r = RepositoryList.find({ _id:this._id }).fetch()[0];

        Meteor.subscribe("CommitMessages");
        // apparently I can only remove docs by ID from untrusted code so...
        var msgs = CommitMessages.find({ repo:r.name }).fetch();
        for (var i=0; i<msgs.length; i++) {
          CommitMessages.remove({ _id:msgs[i]._id });
        }

        RepositoryList.remove({ _id:this._id })
      }
    }
  });


  Template.m_mentors.rendered = function() {
    $('#inputMentorTags').tokenfield({
      autocomplete: {
        source: ['red','blue','green','yellow','violet','brown','purple','black','white'],
        delay: 100
      },
      showAutocompleteOnFocus: true
    });
  };

  Template.m_mentors.helpers({
    all_mentors: function() {
      Meteor.subscribe("Mentors");
      return Mentors.find();
    },
    mentor_queue: function() {
      Meteor.subscribe("MentorQueue");
      return MentorQueue.find();
    }
  });

  Template.m_mentors.events({
    'click #addMentor': function() {
      var name = $("#inputMentorName").val();
      var phone = $("#inputMentorPhone").val();
      var company = $("#inputMentorCompany").val();
      var start = $("#inputMentorStartTime").val();
      var end = $("#inputMentorEndTime").val();
      var tags = $("#inputMentorTags").val().split(",");

      var startTime = new Date(start+":00");
      startTime = new Date(startTime.getTime() + 5*60*60000); // timezone offset
      var endTime = new Date(end+":00");
      endTime = new Date(endTime.getTime() + 5*60*60000); // timezone offset
      var now = new Date();

      Mentors.insert({
        name: name,
        phone: phone,
        company: company,
        startTime: startTime,
        endTime: endTime,
        tags: tags,
        status: false,
        available: true,
        suspended: false,
        override: false,
      });

      $("#inputMentorName").val("");
      $("#inputMentorPhone").val("");
      $("#inputMentorCompany").val("");
      $("#inputMentorStartTime").val("");
      $("#inputMentorEndTime").val("");
      $("#inputMentorTags").val("")

    },

    'click .removeMentor': function() {
      Meteor.subscribe("Mentors");
      if (confirm("Remove this mentor?"))
        Mentors.remove({ _id:this._id });
    },

    'click .overrideMentor': function() {
      Meteor.subscribe("Mentors");
      var state = Mentors.find({ _id:this._id }).fetch()[0].override;
      if (!state) {
        if (confirm("Turn override ON for this mentor?"))
          Mentors.update({ _id:this._id}, {
            $set: {override: true}
          });
      }
      else {
        if (confirm("Turn override OFF for this mentor?"))
          Mentors.update({ _id:this._id }, {
            $set: {override: false}
          });
      }
    },

    'click .editMentor': function() {
      // implement this later
      return;
    },

    'click .clearMentor': function() {
      Meteor.subscribe("Mentors");
      if (confirm("Clear busy state and/or override for this mentor?"))
        Mentors.update({ _id:this._id }, {
          $set: {available:true, override:false, status:true}
        });
    },

    'click .removeMentorRequest': function() {
      Meteor.subscribe("MentorQueue");
      if (confirm("Remove this mentor request?"))
        MentorQueue.remove({ _id:this._id });
    }
  });


  Template.m_users.helpers({
    allUsers: function() {
      Meteor.subscribe("userData");
      return Meteor.users.find();
    }
  });

  Template.m_users.events({
    'click .removeUser': function() {
      if (!Roles.userIsInRole(Meteor.user(), 'super')) {
        alert("You are not authorized to perform this action!");
        return;
      }
      // PREVENT REMOVAL OF ADMIN
      if (Roles.userIsInRole(this._id, 'super')) {
        alert("Cannot remove admin account!");
      }
      else if (confirm("Remove this user?")) {
        Meteor.users.remove({ _id:this._id });
      }
    },

    'click #addUser': function() {
      var username = $("#inputUsername").val();
      var real = $("#inputUserReal").val();
      var email = $("#inputUserEmail").val();
      var pass = $("#inputUserPass").val();
      var pass2 = $("#inputUserPass2").val();

      // check that user is authorized
      if (!Roles.userIsInRole(Meteor.user(), 'super')) {
        alert("You are not authorized to perform this action!");
        return;
      }

      // check that all fields are filled in
      if (username == "" ||
          real == "" ||
          email == "" ||
          pass == "" ||
          pass2 == "") {
        alert("All fields are required!");
        return;
      }

      // check that the passwords match
      if (pass != pass2) {
        alert("Password fields do not match!");
        return;
      }

      // create the new user
      Meteor.call("createNewUser", username, email, pass, real);

      var success = true; // fix this later

      $("#inputUsername").val('');
      $("#inputUserReal").val('');
      $("#inputUserEmail").val('');
      $("#inputUserPass").val('');
      $("#inputUserPass2").val('');

      $("#addUserAlertbox").empty();

      if (success) {
        $("<div>", {
          "class": "alert alert-success alert-dismissible",
          text: "User added successfully"
        }).append('<button type="button" \
          class="close" data-dismiss="alert" \
          aria-hidden="true">&times;</button>').appendTo("#addUserAlertbox");
      }
      else {
        $("<div>", {
          "class": "alert alert-danger alert-dismissible",
          text: "Error creating new user!"
        }).append('<button type="button" \
          class="close" data-dismiss="alert" \
          aria-hidden="true">&times;</button>').appendTo("#addUserAlertbox");
      }
    }
  })


}
