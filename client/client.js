if (Meteor.isClient) {

  var commits_per_page = 10;
  var repos_per_page = 10;


  Template.commits.message = function() {
    // return only the ten most recent commits
    Meteor.subscribe("CommitMessages");
    return CommitMessages.find({}, {sort: {date:-1}, limit:10});
  };

  Template.allCommits.message = function() {
    var commits = CommitMessages.find({}, {sort: {date:-1}}).fetch();
    // sets the commitPage session variable if it's undefined
    Session.setDefault('commitPage', 1);
    var page = Session.get('commitPage');
    var end = page * commits_per_page;
    var start = end - commits_per_page;
    return commits.slice(start,end);
  };

  Template.allCommits.total = function() {
    return CommitMessages.find().fetch().length;
  }

  Template.allCommits.rendered = function() {
    // subscribe to the DB
    Meteor.subscribe("CommitMessages");
    // advance on the commits page
    $("#commitNext").click(function() {
      var page = Session.get("commitPage");
      var total = CommitMessages.find().fetch().length;
      if (page < total/10) {
        page++;
      }
      Session.set("commitPage", page);
    });
    // move back on the commits page
    $("#commitPrev").click(function() {
      var page = Session.get("commitPage");
      if (page != 1) {
        page--;
      }
      Session.set("commitPage", page);
    });
  };

  Template.repos.rendered = function() {
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

  Template.repos.total = function() {
    return RepositoryList.find().fetch().length;
  }

  Template.repos.names = function() {
    var repos = RepositoryList.find().fetch();
    // sets the repoPage session variable if it's undefined
    Session.setDefault('repoPage', 1);
    var page = Session.get('repoPage');
    var end = page * repos_per_page;
    var start = end - repos_per_page;
    // return repos.slice(start,end);
    return repos;
  };

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
      width: 256,
      height: 256,
      text: "hello world" // this will probably have to be absolute
    });
  };

}
