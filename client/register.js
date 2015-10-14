Template.register.helpers({
  register_page: function() {
    if (Session.equals('register_page', 'hacker')) {
      Meteor.setTimeout(function() {
        $('.register-hacker-1')
          .velocity('transition.slideRightBigIn', 1000);
      }, 100);
      return 'register_hacker';
    }
    else if (Session.equals('register_page', 'mentor')) {
      Meteor.setTimeout(function() {
        $('.register-mentor-1')
          .velocity('transition.slideRightBigIn', 1000);
      }, 100);
      return 'register_mentor';
    }
    else if (Session.equals('register_page', 'volunteer')) {
      return 'register_volunteer';
    }
    else if (Session.equals('register_page', 'complete')) {
      Meteor.setTimeout(function() {
        $('.register-complete')
          .velocity('transition.slideRightBigIn', 1000);
      }, 100);
      return 'register_complete';
    }
    else {
      Meteor.setTimeout(function() {
        $('.register-landing').velocity('transition.slideLeftBigIn', 1000);
      }, 100);
      return 'register_landing';
    }
  }
});

Template.register.rendered = function() {
  Meteor.subscribe('userData');
  Meteor.subscribe('AnonUserData');
  Session.set('register_page', 'register_landing');
};

Template.register_landing.events({
  'click .register-btn': function(e) {
    Session.set('register_page', $(e.target).attr('data-action'));
  }
});

Template.register.events({
  'focus ._form-group input': function(e) {
		$(e.target)
			.attr('placeholder', '')
		.parent('._form-group').find('label')
			.velocity({'opacity': 1}, 200);
	},
	'blur ._form-group input': function(e) {
		$(e.target)
			.attr('placeholder', $(e.target).attr('name'))
		.parent('._form-group').find('label')
			.velocity({'opacity': 0}, 200);
	},
  'click .register-btn': function(e) {
    var action = $(e.target).attr('data-action'),
        target = $(e.target).attr('data-target');
    switch (action) {
      case 'init':
        if (target === 'theverybest') {
          var x = [
              'the very best,',
              'like no one ever was.',
              'To catch them is my real test;',
              'to train them is my cause.',

              'I will travel across the land,',
              'searching far and wide.',
              'Each Pokemon to understand',
              'the power that\'s inside',

              'Pokemon, (gotta catch them all) it\'s you and me',
              'I know it\'s my destiny',
              'Pokemon, oh, you\'re my best friend',
              'In a world we must defend',

              'Pokemon, (gotta catch them all) a heart so true',
              'Our courage will pull us through',
              'You teach me and I\'ll teach you',
              '(Po-ke-mon) Gotta catch \'em all'
            ],
            i = +$(e.target).attr('data-index'),
            next = i > x.length-1 ? 0 : i+1;
          $(e.target).css('width', 'auto');
          $(e.target).text(x[next]);
          $(e.target).attr('data-index', next);
        }
        else {
          Session.set('register_page', target);
        }
        break;
      case 'next':
        switch (target) {
          case '.register-mentor-2':
            $('.register-mentor-1')
              .velocity('transition.slideUpBigOut', 1000);
            break;
          case '.register-mentor-3':
            $('.register-mentor-2')
              .velocity('transition.slideUpBigOut', 1000);
            break;
          case '.register-mentor-4':
            $('.register-mentor-3')
              .velocity('transition.slideUpBigOut', 1000);
            break;
          case '.register-hacker-2':
            $('.register-hacker-1')
              .velocity('transition.slideUpBigOut', 1000);
            break;
          case '.register-hacker-3':
            $('.register-hacker-2')
              .velocity('transition.slideUpBigOut', 1000);
            break;
          case '.register-hacker-4':
            $('.register-hacker-3')
              .velocity('transition.slideUpBigOut', 1000);
          default:
            break;
        }
        $(target)
          .delay(1000)
          .velocity('transition.slideUpBigIn', 1000);
        break;
      case 'back':
        switch(target) {
          case '.register-landing':
            Session.set('register_page', 'register-landing');
            break;
          case '.register-mentor-1':
            $('.register-mentor-2').velocity('transition.slideDownBigOut',
              1000);
            $(target)
              .delay(1000)
              .velocity('transition.slideDownBigIn');
            break;
          case '.register-mentor-2':
            $('.register-mentor-3').velocity('transition.slideDownBigOut',
              1000);
            $(target)
              .delay(1000)
              .velocity('transition.slideDownBigIn');
            break;
          case '.register-mentor-3':
            $('.register-mentor-4').velocity('transition.slideDownBigOut',
              1000);
            $(target)
              .delay(1000)
              .velocity('transition.slideDownBigIn');
            break;
          case '.register-hacker-3':
             $('.register-hacker-4').velocity('transition.slideDownBigOut',
              1000);
            $(target)
              .delay(1000)
              .velocity('transition.slideDownBigIn');
            break; 
          case '.register-hacker-2':
             $('.register-hacker-3').velocity('transition.slideDownBigOut',
              1000);
            $(target)
              .delay(1000)
              .velocity('transition.slideDownBigIn');
            break; 
          case '.register-hacker-1':
             $('.register-hacker-2').velocity('transition.slideDownBigOut',
              1000);
            $(target)
              .delay(1000)
              .velocity('transition.slideDownBigIn');
            break;              
        }
        break;
      case 'link':
        Router.go(target);
        break;
      default:
        break;
    }
  },
  'click .register-hacker-3 .register-btn[data-action="register"]': function(e) {
    var $form = $('.register-hacker'),
        $error_box = $('.register-hacker .form-error'),
        $name = $form.find('input[name="Full Name"]'),
        name = $name.val() || '',
        $email = $form.find('input[name="Email"]'),
        email = $email.val() || '',
        $pass1 = $form.find('input[name="Password"]'),
        pass1 = $pass1.val() || '',
        $pass2 = $form.find('input[name="Confirm Password"]'),
        pass2 = $pass2.val() || '',
        $school = $form.find('input[name="School"]'),
        school = $school.val() || '',
        $conduct = $form.find('input[name="conduct"]'),
        conduct = $conduct.is(':checked'),
        $resume = $form.find('input[name="resume"]'),
        resume_file = $resume[0].files[0];

    $error_box.empty();
    $error_box.hide();
    var form_errors = [],       // form errors to be displayed
        first_error = 0;        // first section to contain an error

    // All the form validation
    if (name === '') {
      form_errors.push('Please enter your name.');
      first_error = first_error || 1;
      Forms.highlightError($name, $error_box);
    } 
    if (! Forms.isValidEmail(email)) {
      form_errors.push('Please enter a valid email.');
      first_error = first_error || 1;
      Forms.highlightError($email, $error_box);
    }
    if (! Forms.isValidPassword(pass1)) {
      form_errors.push('Password must be at least 6 characters.');
      first_error = first_error || 1;
      Forms.highlightError($pass1, $error_box);
    }
    if (pass1 !== pass2) {
      form_errors.push('Passwords must match.');
      first_error = first_error || 1;
      Forms.highlightError($pass2, $error_box);
    }
    if (school === '') {
      form_errors.push('Please enter your school.');
      first_error = first_error || 1;
      Forms.highlightError($school, $error_box);
    }
    if (! conduct) {
      form_errors.push('You must agree to the MLH Code of Conduct.');
      first_error = first_error || 1;
      Forms.highlightError($conduct, $error_box);
    }
    if ($resume[0].files.length === 0) {
      form_errors.push('Please upload your resume.');
      first_error = first_error || 1;
      Forms.highlightError($resume, $error_box);
    } 
    else if (resume_file.type !== 'application/pdf') {
      form_errors.push('Resume upload must be a PDF.');
      first_error = first_error || 1;
      Forms.highlightError($resume, $error_box);
    } 
    else if (resume_file.size / 1024 > 1024) {
      form_errors.push('Maximum resume file size is 1MB.');
      first_error = first_error || 1;
      Forms.highlightError($resume, $error_box);
    }

    if (form_errors.length > 0) {
      // Load error messages into error box
      var error_header = document.createElement('strong');
      error_header.appendChild(document.createTextNode('Please fix the following errors:'));
      $error_box.append(error_header);

      for (var i = 0; i < form_errors.length; i++) {
        var listNode = document.createElement('li');
        listNode.appendChild(document.createTextNode(form_errors[i]));
        $error_box.append(listNode);
      }

      $error_box.velocity('transition.bounceIn', 200);

      // Bring user back to the form section that has the first error
      $('.register-hacker-3')
        .velocity('transition.slideUpBigOut', 300);
      $('.register-hacker-' + first_error)
        .velocity('transition.slideUpBigIn', 300);

      return false;
    }

    var races = [];
    $('#race-selection input:checked').each(function() {
      races.push(this.value);
    });
    var provided_race = races.length > 0;

    var gender = $('#gender-selection input:checked').attr('value') || '', 
        provided_gender = gender !== '';

    var diet = [];
    $('#diet-selection input:checked').each(function() {
      diet.push(this.value);
    });

    var bus = $('#bus-selection input:checked').attr('value') || '';

    var reader = new FileReader();

    // Create user when the resume binary data is done reading.
    reader.onload = function(event) {
      var binary_data = new Uint8Array(reader.result);

      var profile = { 
        role: 'hacker',
        name: name,
        school: school,
        diet: diet,
        bus: bus,
        conduct: conduct,
        provided_race: provided_race,
        provided_gender: provided_gender,
        resume: binary_data
      };

      Accounts.createUser(
        {
          email: email,
          password: pass1,
          profile: profile,
        },
        function(err) {
          if (err) {
            if (err.error == 403) {
              Session.set("displayMessage",
                {
                  title: "Account Creation Failed",
                  body: "Account creation failed. Please try again later."
                }
              );
            }
            else {
              Session.set("displayMessage",
                {
                  title: "Error",
                  body: "Something happened. Please try again later."
                }
              );
            }
          }
          else {
            // success
            // add the anonymous user data
            AnonUserData.insert({
              gender: gender,
              race: races
            });
            Session.set('register_page', 'complete');
          }
        }
      );
    }; // end reader.onload()

    reader.readAsArrayBuffer(resume_file);
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

    if (blocks.length === 0) {
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

Template.register_hacker.helpers({
  'races': function() {
    return [
      'Asian / Pacific Islander',
      'Black / African American', 
      'Hispanic / Latino',
      'Middle Eastern',
      'Native American',
      'White'
    ];
  },
  'buses': function() {
    return Meteor.settings.public.buses;
  },
  'diet': function() {
    return Meteor.settings.public.diet;
  }
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
    if (s.getHours() === 0) {
      $("<div>", {
        "class": "time-grid-date row",
        text: s.toLocaleDateString(),
      }).appendTo("#volunteer-time-grid");
    }
    box_count++;
  }
};
