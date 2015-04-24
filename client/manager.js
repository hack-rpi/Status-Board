if (Meteor.isClient) {

  Template.m_commits.helpers({
    commits: function() {
      Meteor.subscribe("CommitMessages");
      var commits = CommitMessages.find({}, {sort: {date:-1}, limit:50}).fetch();
      // sets the commitPage session variable if it's undefined
      Session.setDefault('flagCommitPage', 1);
      var page = Session.get('flagCommitPage');
      var end = page * 10;
      var start = end - 10;
      return commits.slice(start,end);
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
    },

    'click #flagCommitNext': function() {
      Meteor.subscribe("CommitMessages");
      var total = CommitMessages.find().fetch().length;
      var page = Session.get("flagCommitPage");
      if (page < 5 && page < total/10) {
        page++;
      }
      Session.set("flagCommitPage", page);
    },

    'click #flagCommitPrev': function() {
      var page = Session.get("flagCommitPage");
      if (page != 1) {
        page--;
      }
      Session.set("flagCommitPage", page);
    }
  });



  Template.m_repos.helpers({
    repo: function() {
      Meteor.subscribe("RepositoryList");
      var repos = RepositoryList.find({}).fetch();
      // sets the commitPage session variable if it's undefined
      Session.setDefault('m_repoPage', 1);
      var page = Session.get('m_repoPage');
      var end = page * 10;
      var start = end - 10;
      return repos.slice(start,end);
    },

    total: function() {
      Meteor.subscribe("RepositoryList");
      return RepositoryList.find({}).fetch().length;
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
    },

    'click #m_repoNext': function() {
      Meteor.subscribe("RepositoryList");
      var total = RepositoryList.find().fetch().length;
      var page = Session.get("m_repoPage");
      if (page < total/10) {
        page++;
      }
      Session.set("m_repoPage", page);
    },

    'click #m_repoPrev': function() {
      var page = Session.get("m_repoPage");
      if (page != 1) {
        page--;
      }
      Session.set("m_repoPage", page);
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
      var mentors = Mentors.find({}).fetch();
      // sets the session variable if it's undefined
      Session.setDefault('mentorPage', 1);
      var page = Session.get('mentorPage');
      var end = page * 10;
      var start = end - 10;
      return mentors.slice(start,end);
    },
    mentor_queue: function() {
      Meteor.subscribe("MentorQueue");
      var Q = MentorQueue.find({}).fetch();
      // sets the session variable if it's undefined
      Session.setDefault('mentorQPage', 1);
      var page = Session.get('mentorQPage');
      var end = page * 10;
      var start = end - 10;
      return Q.slice(start,end);
    },
    queue_length: function() {
      Meteor.subscribe("MentorQueue");
      return MentorQueue.find({}).fetch().length;
    },
    total_mentors: function() {
      Meteor.subscribe("Mentors");
      return Mentors.find({}).fetch().length;
    }
  });

  Template.m_mentors.events({
    'click #addMentor': function() {
      var name = $("#inputMentorName").val();
      var phone = $("#inputMentorPhone").val();
      var company = $("#inputMentorCompany").val();
      var start = $("#inputMentorStartTime").val();
      var end = $("#inputMentorEndTime").val();
      var tags = $("#inputMentorTags").val().split(",")
        .map(function(tag){
            return tag.trim().toLowerCase();
          });

      var tagSet = new Set(tags);

      tags = [];

      tagSet.forEach(function(tag){
        tags.push(tag);
      });

      if (name == "" ||
          phone == "" ||
          company == "" ||
          start == "" ||
          end == "" ||
          tags.length == 0) {
        alert("Please complete all fields!");
        return;
      }

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
        active: false,
        available: true,
        suspended: false,
        override: false,
      });

      $("#inputMentorName").val("");
      $("#inputMentorPhone").val("");
      $("#inputMentorCompany").val("");
      $("#inputMentorStartTime").val("");
      $("#inputMentorEndTime").val("");
      $("#inputMentorTags").val([]);

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

    'click .suspendMentor': function() {
      Meteor.subscribe("Mentors");
      var state = Mentors.find({ _id:this._id }).fetch()[0].suspended;
      if (!state) {
        if (confirm("Suspend activity for this mentor?"))
          Mentors.update({ _id:this._id}, {
            $set: {suspended: true}
          });
      }
      else {
        if (confirm("Unsuspend activity for this mentor?"))
          Mentors.update({ _id:this._id }, {
            $set: {suspended: false}
          });
      }
    },

    'click .editMentor': function() {
      // implement this later
      return;
    },

    'click .clearMentor': function() {
      Meteor.subscribe("Mentors");
      if (confirm("Clear busy state, override, and suspend for this mentor?"))
        Mentors.update({ _id:this._id }, {
          $set: {available:true, suspended:false, override:false, status:true}
        });
    },

    'click .removeMentorRequest': function() {
      Meteor.subscribe("MentorQueue");
      if (confirm("Remove this mentor request?"))
        MentorQueue.remove({ _id:this._id });
    },

    'click #mentorQueueNext': function() {
      Meteor.subscribe("MentorQueue");
      var total = MentorQueue.find().fetch().length;
      var page = Session.get("mentorQPage");
      if (page < total/10) {
        page++;
      }
      Session.set("mentorQPage", page);
    },

    'click #mentorQueuePrev': function() {
      var page = Session.get("mentorQPage");
      if (page != 1) {
        page--;
      }
      Session.set("mentorQPage", page);
    },

    'click #mentorListNext': function() {
      Meteor.subscribe("Mentors");
      var total = Mentors.find().fetch().length;
      var page = Session.get("mentorPage");
      if (page < total/10) {
        page++;
      }
      Session.set("mentorPage", page);
    },

    'click #mentorListPrev': function() {
      var page = Session.get("mentorPage");
      if (page != 1) {
        page--;
      }
      Session.set("mentorPage", page);
    },
  });


  Template.m_users.helpers({
    allUsers: function() {
      Meteor.subscribe("userData");
      return Meteor.users.find();
    },
    allRoles: function() {
      Meteor.subscribe("userRoles");
      var roles = Roles.getAllRoles().fetch();
      var parsed_roles = [];
      for (var i=0; i<roles.length; i++) {
        if (roles[i].name != 'super')
          parsed_roles.push(roles[i]);
      }
      return parsed_roles;
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
      var roles = $("#inputUserRoles").val();
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
      Meteor.call("createNewUser", username, email, roles, pass, real);

      var success = true; // fix this later

      $("#inputUsername").val('');
      $("#inputUserReal").val('');
      $("#inputUserEmail").val('');
      $("#inputUserRoles").val('');
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
