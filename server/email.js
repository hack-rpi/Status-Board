/**
 * server/email.js
 */
Meteor.methods({

  /**
   * 
   */
  'sendEmail': function(to, subject, data, template) {
    // add asset locations
    data.logo_url = Meteor.absoluteUrl('img/hackrpi_logo_red.png');
    // compile the email template
    SSR.compileTemplate('email', 
		  Assets.getText('emailTemplates/' + template + '.html'));
	  var html = SSR.render('email', data);
    // let the client continue with other calls
    this.unblock();
    // send the email
    Email.send({
      to: to,
      from: 'team@hackrpi.com',
      subject: subject,
      html: html,
      text: Assets.getText('emailTemplates/' + template + '.txt'),
    });
  }

});