// NOTE:
// This code will be executed on both the client and the server!

CommitMessages = new Meteor.Collection("CommitMessages");
RepositoryList = new Meteor.Collection("RepositoryList");

// iron router
Router.route("/", function() {
  this.render("home", {data: {title:"HackRPI Status Board"}});
});

Router.route('allCommits');
Router.route('repos');
Router.route('manage');
