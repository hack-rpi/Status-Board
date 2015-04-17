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
      Session.set("displayMessage", {title: "Error", body: "Invalid email address"});
      return false;
    }
    if (!isValidPassword(pass1)) {
      Session.set("displayMessage", {title: "Error", body: "Password length must be at least 6 characters"});
      return false;
    }
    if (pass1 != pass2) {
      Session.set("displayMessage", {title: "Error", body: "Passwords do not match"});
      return false;
    }

    var profile = {
      "role": "hacker"
    }

    Accounts.createUser({email: email, password: pass1, profile: profile}, function(err) {
      if (err) {
        if (err.error == 403) {
          Session.set("displayMessage", {title: "Access Denied", body: "Account creation may be currently disabled"});
        }
        else {
          Session.set("displayMessage", {title: "Error", body: "Something went wrong. Please try again later"});
        }
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
    // check input on page 1
    var name = trimInput($("#reg-mentor-name").val()),
        affil = trimInput($("#reg-mentor-affiliation").val()),
        phone = trimInput($("#reg-mentor-phone").val()),
        email = trimInput($("#reg-mentor-email").val()),
        pass1 = trimInput($("#reg-mentor-pass1").val()),
        pass2 = trimInput($("#reg-mentor-pass2").val());
    if (!name || !affil || !phone || !email || !pass1 || !pass2)
      Session.set("displayMessage", {title: "Field Required", body: "One or more required fields are empty"});
    else if (!stripPhone(phone))
      Session.set("displayMessage", {title: "Error", body: "Invalid phone number"});
    else if (!isValidEmail(email))
      Session.set("displayMessage", {title: "Error", body: "Invalid email"});
    else if (!isValidPassword(pass1))
      Session.set("displayMessage", {title: "Error", body: "Password must be at least 6 characters"});
    else if (pass1 != pass2)
      Session.set("displayMessage", {title: "Error", body: "Passwords do not match"});
    else {
      $("#reg-mentor-page1").toggle("slide");
      $("#reg-mentor-page2").toggle("slide");
    }
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
  'click #reg-mentor-submit': function(e,t) {
    e.preventDefault();
    var name  = trimInput($("#reg-mentor-name").val()),
        affil = trimInput($("#reg-mentor-affiliation").val()),
        phone = trimInput($("#reg-mentor-phone").val()),
        email = trimInput($("#reg-mentor-email").val()),
        pass1 = trimInput($("#reg-mentor-pass1").val()),
        pass2 = trimInput($("#reg-mentor-pass2").val()),
        languages = [],
        frameworks = [],
        apis = [],
        tags = [];

    $("#reg-mentor-languages input:checked").each(function() {
      languages.push(this.name); tags.push(this.name);
    });
    $("#reg-mentor-frameworks input:checked").each(function() {
      frameworks.push(this.name); tags.push(this.name);
    });
    $("#reg-mentor-apis input:checked").each(function() {
      apis.push(this.name); tags.push(this.name);
    });

    phone = stripPhone(phone);

    Accounts.createUser({ email: email,
        password: pass1,
        profile: {
          role: "mentor",
          name: name,
          affiliation: affil,
          phone: phone,
          languages: languages,
          frameworks: frameworks,
          apis: apis,
          active: false,
          available: true,
          mentee_id: null,
          history: [],
          tags: tags
        },
      }, function(err) {
      if (err) {
        if (err.error == 403) {
          Session.set("displayMessage", {title: "Access Denied", body: "Account creation is currently disabled"});
        }
        else {
          Session.set("displayMessage", {title: "Error", body: "Something went wrong. Please try again later"});
        }
      }
      else {
        // success
        Router.go("/");
      }
    });
    return false;
  },
  // -------------------------------------------------------------------------
  'click #reg-volunteer-page1-next': function(e) {
    var fname = trimInput($("#reg-volunteer-fname").val()),
        lname = trimInput($("#reg-volunteer-lname").val()),
        phone = trimInput($("#reg-volunteer-phone").val()),
        email = trimInput($("#reg-volunteer-email").val()),
        pass1 = trimInput($("#reg-volunteer-pass1").val()),
        pass2 = trimInput($("#reg-volunteer-pass2").val());
    if (!fname || !lname || !phone || !email || !pass1 || !pass2)
      Session.set("displayMessage", {title: "Field Required", body: "One or more required fields are empty"});
    else if (!stripPhone(phone))
      Session.set("displayMessage", {title: "Error", body: "Invalid phone number"});
    else if (!isValidEmail(email))
      Session.set("displayMessage", {title: "Error", body: "Invalid email"});
    else if (!isValidPassword(pass1))
      Session.set("displayMessage", {title: "Error", body: "Password must be at least 6 characters"});
    else if (pass1 != pass2)
      Session.set("displayMessage", {title: "Error", body: "Passwords do not match"});
    else {
      $("#reg-volunteer-page1").toggle("slide");
      $("#reg-volunteer-page2").toggle("slide");
    }
  },
  'click #reg-volunteer-page2-prev': function(e) {
    $("#reg-volunteer-page2").toggle("slide");
    $("#reg-volunteer-page1").toggle("slide");
  },
  'click .time-grid-box': function(e) {
    $(e.currentTarget).toggleClass("time-grid-box-selected");
    if ($(e.currentTarget).attr('is_selected') == 'true')
      $(e.currentTarget).attr('is_selected', 'false');
    else
      $(e.currentTarget).attr('is_selected', 'true');
  },
  'click #reg-volunteer-submit': function(e) {
    e.preventDefault();
    var fname = trimInput($("#reg-volunteer-fname").val()),
        lname = trimInput($("#reg-volunteer-lname").val()),
        phone = trimInput($("#reg-volunteer-phone").val()),
        email = trimInput($("#reg-volunteer-email").val()),
        pass1 = trimInput($("#reg-volunteer-pass1").val()),
        pass2 = trimInput($("#reg-volunteer-pass2").val()),

    phone = stripPhone(phone);

    var in_block = false,
        block_start = null,
        block_end = null,
        blocks = [];
    $(".time-grid-box").each(function() {
      if ($(this).attr('is_selected') == 'true') {
        if (!in_block) {
          in_block = true;
          block_start = $(this).attr('date');
        }
        block_end = $(this).attr('date');
      }
      else if (in_block) {
        in_block = false;
        block_end = new Date(block_end);
        block_end.setHours(block_end.getHours()+1);
        blocks.push({start:new Date(block_start), end:block_end});
      }
    });
    if (in_block) {
      block_end = new Date(block_end);
      block_end.setHours(block_end.getHours()+1);
      blocks.push({start:new Date(block_start), end:block_end});
    }

    if (blocks.length == 0) {
      Session.set("displayMessage", {title: "Field Required", body: "Please select the hours you are available"});
      return false;
    }

    Accounts.createUser({ email: email,
                          password: pass1,
                          profile: {
                            first_name: fname,
                            last_name: lname,
                            phone: phone,
                            blocks: blocks,
                          },
      }, function(err) {
      if (err) {
        if (err.error == 403) {
          Session.set("displayMessage", {title: "Access Denied", body: "Account creation is currently disabled"});
        }
        else {
          Session.set("displayMessage", {title: "Error", body: "Something went wrong. Please try again later"});
        }
      }
      else {
        // success
        Router.go("/");
      }
    });

    return false;
  },
});

Template.register_mentor.helpers({
  'languages': function() {
    return Meteor.settings.public.languages;
  },
  'frameworks': function() {
    return Meteor.settings.public.frameworks;
  },
  'apis': function() {
    return Meteor.settings.public.apis;
  },
});

Template.register_volunteer.rendered = function() {
  var s = new Date(Meteor.settings.public.event_start);
  var e = new Date(Meteor.settings.public.event_end);
  var box_count = 0;
  $("<div>", {
    "class": "time-grid-date row",
    text: s.toLocaleDateString(),
  }).appendTo("#volunteer-time-grid");
  while (s < e) {
    $("<div>", {
      id: 'time-grid-box-' + box_count,
      'class': 'time-grid-box',
      date: s,
      is_selected: 'false',
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
