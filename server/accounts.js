// Construct new users, add to roles, and validate new user data
Accounts.onCreateUser(function(options, user) {
  user.profile = options.profile;
  user.settings = user.settings || {};
  user.settings.accepted = {
    flag: false,
    expires: null,
    travel: {
      method: null,
      reimbursement: 0,
    }
  };
  user.settings.bus_captain = false;
  user.settings.checked_in = false;
  user.settings.wifi_username = null;
  user.settings.confirmed = {
    flag: null,
    travel: {
      accepted: false,
      explaination: null,
    }
  };
  if (options.profile.role == "hacker")
    user.roles = ["hacker"];
  else if (options.profile.role == "mentor")
    user.roles = ["mentor"];
  else if (options.profile.role == "volunteer")
    user.roles = ["volunteer"];
  return user;
});

Accounts.validateNewUser(function(user) {
  if (_.contains(user.roles, 'admin') || _.contains(user.roles, 'announcer'))
    return false;
  else
    return true;
});

Meteor.methods({
  'sendPasswordResetEmail': function(email) {
    var doc = Accounts.findUserByEmail(email)
    if (! doc) {
      throw new Meteor.Error('Email Not Found',
        'No user found with email address: ' + email);
    }
    Accounts.sendResetPasswordEmail(doc._id);
    return true;
  }
});


/**
 * Email Template Defaults
 */
Accounts.emailTemplates.from = 'gohackrpi.status@gmail.com';
Accounts.emailTemplates.siteName = 'status.hackrpi.com';

Accounts.emailTemplates.resetPassword.subject = function(user) {
  return 'HackRPI Status Board - Reset Password';
}
Accounts.emailTemplates.resetPassword.text = function(user, url) {
  return 'Hello ' + user.profile.name + ', \n\n' +
  'Use the link below to reset your password. If you did not' + 
  ' not request this email, no action need be taken. \n\n' +
  url + '\n\n' +
  '- The HackRPI Team';
}
Accounts.emailTemplates.resetPassword.html = function(user, url) {
  SSR.compileTemplate('resetPasswordText', 
    Assets.getText('emailTemplates/passwordReset.html'));
  return SSR.render('resetPasswordText', {
    logo_url: Meteor.absoluteUrl('img/hackrpi_logo_cropped.png'), 
    name: user.profile.name,
    url: url
  });
}