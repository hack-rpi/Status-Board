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
    SSR.compileTemplate('standardEmail', 
		  Assets.getText('emailTemplates/' + template));
	  var html = SSR.render('standardEmail', data);
    // let the client continue with other calls
    this.unblock();
    // send the email
    Email.send({
      to: to,
      from: 'support@hackrpi.com',
      subject: subject,
      html: html
    });
  }

});