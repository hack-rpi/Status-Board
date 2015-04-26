// trim helper
var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
};

// valid password as per requirements
var isValidPassword = function(val) {
   return val.length >= 6;
};

// validate input email
var isValidEmail = function(email) {
	return email.length > 6 && email.search("@");
};

// trim whitespace from the input
var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
};

var stripPhone = function(phone) {
  return phone;
};

Template.login.events({
  'submit #login-form' : function(e, t){
    e.preventDefault();
    // retrieve the input field values
    var email = t.find('#login-email').value,
        password = t.find('#login-password').value;

    email = trimInput(email);
    password = trimInput(password);

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
