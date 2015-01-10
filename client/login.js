if (Meteor.isClient) {

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
  }

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
          Session.set("displayMessage", "Error & Invalid username, email, or password")
				}
        else {
          // The user has been logged in.
					Router.go("/");
				}
      });
      return false;
      },
  });

  // ---------------------------------------------------------------------------
  Template.register.helpers({
    register_page: function() {
      var page = Session.get('register_page');
      if (page == 'register_participant_btn')
        return 'register_participant';
      else if (page == 'register_mentor_btn') {
        $("#reg-mentor-page1").removeClass("reg-page-hidden");
        return 'register_mentor';
      }
      else if (page == 'register_volunteer_btn')
        return 'register_volunteer';
      else
        return 'register_welcome';
    }
  });

  Template.register.rendered = function() {
    Session.set('register_page', 'register_welcome');
  };

  Template.register.events({
    'click .register-btn-start': function(e) {
      Session.set('register_page', e.currentTarget.id);
    },
    // -------------------------------------------------------------------------
    'submit #register_form_participant': function(e, t) {
      e.preventDefault();
      var email = t.find("#reg-participant-email").value,
          pass1 = t.find("#reg-participant-pass1").value,
          pass2 = t.find("#reg-participant-pass2").value;

      if (!isValidEmail(email)) {
        Session.set("displayMessage", "Error & Invalid email address");
        return false;
      }
      if (!isValidPassword(pass1)) {
        Session.set("displayMessage", "Error & Password length must be at least 6 characters");
        return false;
      }
      if (pass1 != pass2) {
        Session.set("displayMessage", "Error & Passwords do not match");
        return false;
      }

      Accounts.createUser({email: email, password: pass1}, function(err) {
        if (err) {
          Session.set("displayMessage", "Error & Something went wrong. Please try again later");
        }
        else {
          // success
          Router.go("/");
        }
      });

      return false;
    },
    // -------------------------------------------------------------------------
    'click #reg-mentor-page1-next': function(e) {
      $("#reg-mentor-page1").toggle("slide");
      $("#reg-mentor-page2").toggle("slide");
    },
    'click #reg-mentor-page2-prev': function(e) {
      $("#reg-mentor-page2").toggle("slide");
      $("#reg-mentor-page1").toggle("slide");
    },
    'click #reg-mentor-page2-next': function(e) {
      $("#reg-mentor-page2").toggle("slide");
      $("#reg-mentor-page3").toggle("slide");
    },
    'click #reg-mentor-page3-prev': function(e) {
      $("#reg-mentor-page3").toggle("slide");
      $("#reg-mentor-page2").toggle("slide");
    },
    'click #reg-mentor-page3-next': function(e) {
      $("#reg-mentor-page3").toggle("slide");
      $("#reg-mentor-page4").toggle("slide");
    },
    'click #reg-mentor-page4-prev': function(e) {
      $("#reg-mentor-page4").toggle("slide");
      $("#reg-mentor-page3").toggle("slide");
    },
    // -------------------------------------------------------------------------
    'click #reg-volunteer-page1-next': function(e) {
      $("#reg-volunteer-page1").toggle("slide");
      $("#reg-volunteer-page2").toggle("slide");
    },
    'click #reg-volunteer-page2-prev': function(e) {
      $("#reg-volunteer-page2").toggle("slide");
      $("#reg-volunteer-page1").toggle("slide");
    },
    'click .time-grid-box': function(e) {
      $("#"+e.currentTarget.id).toggleClass("time-grid-box-selected");
    },
  });

  Template.register_volunteer.rendered = function() {
    var s = config.event_start;
    var e = config.event_end;
    // var s = new Date("November 15, 2014 00:00:00");
    // var e = new Date("November 16, 2014 00:00:00");
    // console.log(s);
    // console.log(e);
    var box_count = 0;
    $("<div>", {
      "class": "time-grid-date row",
      text: s.toLocaleDateString(),
    }).appendTo("#volunteer-time-grid");
    while (s < e) {
      $("<div>", {
        id: 'time-grid-box-' + box_count,
        'class': 'time-grid-box',
        text: s.getHours() + ':00',
      }).appendTo("#volunteer-time-grid");
      s.setHours(s.getHours()+1);
      if (s.getHours() == 0) {
        $("<div>", {
          "class": "time-grid-date row",
          text: s.toLocaleDateString(),
        }).appendTo("#volunteer-time-grid");
      }
      box_count++;
    }
  };

}
