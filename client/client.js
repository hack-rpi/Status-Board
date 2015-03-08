if (Meteor.isClient) {

  // This function is automatically called whenever the displayMessage Session
  //  variable is updated
  Tracker.autorun(function() {
    var message = Session.get("displayMessage");
    if (message) {
      if (message.title && message.body) {
        $(".overlayMessage").remove();
        popupTitle = message.title;
        popupBody = message.body;
      }
      else {
        popupTitle = "Internal Error";
        popupBody = "Something went wrong! :(";
      }
      popupDep.changed();
      $("#info-modal").modal('show');
      Session.set("displayMessage", null);
    }
  });

  var popupTitle = "";
  var popupBody = "";
  var popupDep = new Tracker.Dependency;

  Template.popup.helpers({
    title: function() {
      popupDep.depend();
      return popupTitle;
    },
    body: function() {
      popupDep.depend();
      return popupBody;
    },
  });

  var commits_per_page = 10;
  var repos_per_page = 10;

  Template.commits.helpers({
    message: function() {
      // return only the ten most recent commits
      Meteor.subscribe("CommitMessages");
      return CommitMessages.find({}, {sort: {date:-1}, limit:10});
    },
  });

  Template.commits.rendered = function() {
    // mark the page as active
    Session.set('active-page', 'nav-home');
  };

  // Template.allCommits.helpers({
  //   message: function() {
  //     var commits = CommitMessages.find({}, {sort: {date:-1}}).fetch();
  //     // sets the commitPage session variable if it's undefined
  //     Session.setDefault('commitPage', 1);
  //     var page = Session.get('commitPage');
  //     var end = page * commits_per_page;
  //     var start = end - commits_per_page;
  //     return commits.slice(start,end);
  //   },
  //   total: function() {
  //     return CommitMessages.find().fetch().length;
  //   },
  // });
  //
  // Template.allCommits.rendered = function() {
  //   // mark the page as active
  //   Session.set('active-page', 'nav-commits');
  //   // subscribe to the DB
  //   Meteor.subscribe("CommitMessages");
  //   // advance on the commits page
  //   $("#commitNext").click(function() {
  //     var page = Session.get("commitPage");
  //     var total = CommitMessages.find().fetch().length;
  //     if (page < total/10) {
  //       page++;
  //     }
  //     Session.set("commitPage", page);
  //   });
  //   // move back on the commits page
  //   $("#commitPrev").click(function() {
  //     var page = Session.get("commitPage");
  //     if (page != 1) {
  //       page--;
  //     }
  //     Session.set("commitPage", page);
  //   });
  // };

  Template.repos.rendered = function() {
    // mark the page as active
    Session.set('active-page', 'nav-repo');

    Meteor.subscribe("RepositoryList");
    // advance on the repo list
    $("#repoNext").click(function() {
      var page = Session.get("repoPage");
      var total = RepositoryList.find().fetch().length;
      if (page < total/10) {
        page++;
      }
      Session.set("repoPage", page);
    });
    // move back on the repo page
    $("#repoPrev").click(function() {
      var page = Session.get("repoPage");
      if (page != 1) {
        page--;
      }
      Session.set("repoPage", page);
    });
  };

  Template.repos.helpers({
    total: function() {
      return RepositoryList.find().fetch().length;
    },
    names: function() {
      var repos = RepositoryList.find().fetch();
      // sets the repoPage session variable if it's undefined
      Session.setDefault('repoPage', 1);
      var page = Session.get('repoPage');
      var end = page * repos_per_page;
      var start = end - repos_per_page;
      // return repos.slice(start,end);
      return repos;
    },
  });

  Template.repos.events({
    'click #addRepoBtn': function() {
      // clear any old output messages
      $("#repoAlertBox").empty();
      var username = $('#inputUsername').val();
      var repo = $('#inputRepo').val();
      $("#inputUsername").val('');
      $("#inputRepo").val('');

      // first check if already in database
      if (RepositoryList.find({ name: repo }).fetch().length != 0) {
        $("<div>", {
          "class": "alert alert-warning alert-dismissible",
          text: "Repository has already been added!"
        }).append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>').appendTo("#repoAlertBox");

        console.log("repo already exists");
        return;
      }
      // then check if the repo is valid (exists on github)
      // this has to be asynchronous! (idk why it just does)
      Meteor.call("getCommit", username, repo, function(error, result) {
        if (!result) {
          $("<div>", {
            "class": "alert alert-danger alert-dismissible",
            text: "Repository does not exist!"
          }).append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>').appendTo("#repoAlertBox");
          console.log("not a valid repo");
          return;
        }
        // if all good, then go ahead and add it to the database
        RepositoryList.insert({
          name: repo,
          owner: username
        });
        $("<div>", {
          "class": "alert alert-success alert-dismissible",
          text: "Repository added successfully!"
        }).append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>').appendTo("#repoAlertBox");
        console.log("repo added successfully");
      });
    }
  });

  Template.repoqr.rendered = function() {
    // generate qr code
    $("#QR-repo").qrcode({
      width: 250,
      height: 250,
      text: "http://status.hackrpi.com/repos"
    });
  };

  Template.mentor.helpers({
    allTags: function() {
      // create and return a list of all the tags from the mentors
      Meteor.subscribe("Mentors");
      var mentors = Mentors.find({ $or: [{suspended:false}, {override:true}] }).fetch();
      if (mentors.length == 0)
        return; // bail
      var tagSet = new Set();
      for (var m=0; m<mentors.length; m++) {
        if (mentors[m].active == false && mentors[m].override == false)
          continue; // skip unactive mentors
        for (var i=0; i<mentors[m]["tags"].length; i++) {
          tagSet.add(mentors[m]["tags"][i]);
        }
      }
      // convert to an array for spacebars
      var arrayTags = [];
      tagSet.forEach(function(value){ arrayTags.push(value) });
      return arrayTags.sort();
    },
  });

  Template.mentor.events({
    'click #findMentor': function() {
      var name = $("#inputFindMentorName").val();
      var loc = $("#inputFindMentorLocation").val();
      var phone = $("#inputFindMentorPhone").val();
      var tags = $("#inputIssueTags").val();
      var now = new Date();

      // check the spam timer
      var prev = Session.get("mentorRequestTimer");
      // prev = false; // debug
      if (!prev || now > prev ) {

        // error check the fields
        if (name == "")
          alert("Name field cannot be empty!");
        else if (loc == "")
          alert("Location field cannot be empty!");
        else if (tags.length == 0)
          alert("What's the issue deary?");
        else {
          MentorQueue.insert({
            name: name,
            loc: loc,
            phone: phone,
            tags: tags,
            helped: false,
            timestamp: now,
          });

          $("<div>", {
            "class": "alert alert-success alert-dismissible",
            text: "Mentor requested successfully! If you provided a phone number, \
                    we will text you when a mentor is looking for you!"
          }).append('<button type="button" class="close" \
                      data-dismiss="alert" aria-hidden="true">\
                      &times;</button>').appendTo("#findMentorAlertBox");

          // set a timer to avoid being spammed
          var d = new Date();
          var goTime = new Date(d.getTime() + 5*60000);
          Session.set("mentorRequestTimer", goTime);
        }
      }
      else {
        alert("Please don't spam our mentors :( \n Wait at least 5 minutes between requests!");
      }
    }
  });

  Template.mentor.rendered = function() {
    // mark the page as active
    Session.set('active-page', 'nav-mentor');
  };

  Template.info.rendered = function() {
    // mark the page as active
    Session.set('active-page', 'nav-info');
  }
}
