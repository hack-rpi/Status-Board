Router.route("/", function() {
  this.render("commits", {data: {title:"HackRPI Status Board"}});
});

Router.route('mentor');
Router.route('info');
Router.route('login');
Router.route('register');
Router.route('user');

Router.configure({notFoundTemplate: '404'});
