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

Template.register_mentor.events({
  'click .btn[data-action="mentor-register"]': function(e,t) {
    e.preventDefault();

    var $error_box = $('.form-error'),
        $email = $('input[name="Email"]'),
        email = $email.val() || '',
        $pass1 = $('input[name="Password"]'),
        pass1 = $pass1.val() || '',
        $pass2 = $('input[name="Confirm Password"]'),
        pass2 = $pass2.val() || '',
        $name = $('input[name="Full Name"]'),
        name = $name.val() || '',
        $affiliation = $('input[name="Affiliation"]'),
        affiliation = $affiliation.val() || '',
        $phone = $('input[name="Phone Number"]'),
        phone = $phone.val() || '',
        $languages = $('#language-selection'),
        languages = _.map($languages.find('input:checked'), function(d) {
          return $(d).attr('value');
        }) || [],
        $frameworks = $('#framework-selection'),
        frameworks = _.map($frameworks.find('input:checked'), function(d) {
          return $(d).attr('value');
        }) || [],
        $apis = $('#api-selection'),
        apis = _.map($apis.find('input:checked'), function(d) {
          return $(d).attr('value');
        }) || [],
        tags = _.flatten([languages, frameworks, apis]);

    phone = Forms.stripPhone(phone);

    $error_box.empty();
    $error_box.hide();
    var form_errors = [],  // form errors to be displayed
        first_error = 0;   // first section to contain an error

    if (name === '') {
      form_errors.push('Please enter your name.');
      first_error = first_error || 1;
      Forms.highlightError($name);
    }

    if (! Forms.isValidEmail(email)) {
      form_errors.push('Please enter a valid email');
      first_error.first_error || 1;
      Forms.highlightError($email);
    }

    if (! Forms.isValidPassword(pass1)) {
      form_errors.push('Password must be at least 6 characters.');
      first_error.first_error || 1;
      Forms.highlightError($pass1);
    }

    if (pass1 !== pass2) {
      form_errors.push('Passwords must match.');
      first_error.first_error || 1;
      Forms.highlightError(pass2);
    }

    if (! phone) {
      form_errors.push('Please enter a valid phone number.');
      first_error.first_error || 1;
      Forms.highlightError($phone);
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
      $('.register-mentor-4')
        .velocity('transition.slideUpBigOut', 300);
      $('.register-mentor-' + first_error)
        .velocity('transition.slideUpBigIn', 300);

      return false;
    }

    var profile = {
          role: "mentor",
          name: name,
          affiliation: affiliation,
          phone: phone,
          languages: languages,
          frameworks: frameworks,
          apis: apis,
          active: false,
          available: true,
          mentee_id: null,
          history: [],
          tags: tags
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
                body: err.reason
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
          var subject = 'HackRPI 2016 Registration Complete!'
          Meteor.call('sendEmail', 
            email, 
            subject, 
            {
              name: name,
              subject: subject,
            },
            'mentor_confirm'
          );
          Session.set('register_page', 'complete');
          return true;
        }
    });
    return false;
  }
});
