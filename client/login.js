Template.login.events({
  'submit #login-form' : function(e, t){
    e.preventDefault();
    // retrieve the input field values
    var email = t.find('#login-email').value,
        password = t.find('#login-password').value;

    email = Forms.trimInput(email);
    password = Forms.trimInput(password);

    // If validation passes, supply the appropriate fields to the
    // Meteor.loginWithPassword() function.
    Meteor.loginWithPassword(email, password, function(err){
      if (err) {
        // The user might not have been found, or their passwword
        // could be incorrect. Inform the user that their
        // login attempt has failed.
        Session.set("displayMessage", {title: "Error", body: "Invalid username, email, or password"});
			}
      else {
        // The user has been logged in.
        Session.set("selectedUserId", Meteor.userId());
				Router.go("/user");
			}
    });
    return false;
    }
});
