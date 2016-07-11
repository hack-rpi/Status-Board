/**
 * client/script/pre-event/preregister.js
 */

Template.preregister.rendered = function() {
  Meteor.typeahead.inject();
  Meteor.subscribe('USColleges');
}

Template.preregister.helpers({
  schools: function() {
    return USColleges.find().fetch().map(function(d) { return d.name; });
  }
});

Template.preregister.events({
  'click button.prereg': function(event) {
    var form = $('form.prereg'),
        $name_field = form.find('input[name="Name"]'),
        $email_field = form.find('input[name="Email"]'),
        $school_field = form.find('input[name="School"]');
    // Error check the input fields
    if ($name_field.val() === '') {
      Forms.highlightError($name_field);
      return;
    }
    if (!Forms.isValidEmail($email_field.val())) {
      Forms.highlightError($email_field);
      return;
    }
    if ($school_field.val().length <= 3) {
      Forms.highlightError($school_field);
      return;
    }
    // Preform the insert
    PreRegistration.insert({
      name: $name_field.val(),
      email: $email_field.val(),
      school: $school_field.val()
    }, function(error, _id) {
      if (error) {
        if (error.error === 'Email Exists') {
          Session.set('displayMessage', {
            title: 'Error',
            body: 'That email address has already been preregistered.'
          });
        } else {
          Session.set("displayMessage", {
            title: "Error", 
            body: "Something went wrong and we were unable to complete your " +
              "preregistration. Please try again later and if the problem " +
              "persists please email us at support@hackrpi.com."
          });
        }
      } else {
        Session.set("displayMessage", {
          title: "Preregistration Complete", 
          body: "You're all set! You should receive a confirmation email " +
            "shortly."
        });
        var subject = 'HackRPI Preregistration Complete!'
        Meteor.call('sendEmail', 
          $email_field.val(), 
          subject, 
          {
            name: $name_field.val(),
            subject: subject,
          },
          'prereg_confirm.html'
        );
        $name_field.val('');
        $email_field.val('');
        $school_field.val('');
      }
    });
  }
});
