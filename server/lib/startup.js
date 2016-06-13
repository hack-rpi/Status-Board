/**
 * server/lib/startup.js
 * 
 * Tasks to complete when the server starts up.
 */
Meteor.startup(function() {

  // create the necessary indexes here
  // NOTE: The underscore before ensureIndex indicates that the function is
  //  undocumented by the Meteor Dev Group
  CommitMessages._ensureIndex({ 'date': 1 });
  CommitMessages._ensureIndex({ 'total_flags': 1 });

  Meteor.users._ensureIndex({ 'roles': 1 });
  Meteor.users._ensureIndex({ 'profile.name': 1 });
  Meteor.users._ensureIndex({ 'profile.affiliation': 1 });
  Meteor.users._ensureIndex({ 'profile.phone': 1 });
  Meteor.users._ensureIndex({ 'roles': 1, 'profile.active': 1,
    'profile.available': 1 });

  RepositoryList._ensureIndex({ 'name': 1 });
  RepositoryList._ensureIndex({ 'full_name': 1 });

  Announcements._ensureIndex({ 'visible': 1 });

  MentorQueue._ensureIndex({ 'completed': 1 });


  /**
   * Load the list of US Colleges into a Collection so we can use it in a 
   * 	typeahead box
   */
  if (USColleges.find().count() == 0) {
    Assets.getText('colleges-us.txt', function(error, res) {
      if (error) {
        console.error('ERROR: Could not log US Colleges list.');
        return;
      }
      list = res.split('\n');
      for (var d in list) {
        USColleges.insert({
          name: list[d].replace('\r', '')
        });
      }
    });
  }

  // Server Variables ========================================================
  admin_doc = Meteor.users.findOne({
    'username': Meteor.settings.default_admin_username
  });
  admin_id = "";
  if (admin_doc)
    admin_id = admin_doc._id;
  // =========================================================================

  // create the admin account with a default password
  // if ( Meteor.users.find({ username: Meteor.settings.default_admin_username })
  //     .fetch().length === 0) {
  //   console.log(">> admin account created");
  //   admin_id = Accounts.createUser({
  //     "username": Meteor.settings.default_admin_username,
  //     "password": Meteor.settings.default_admin_password,
  //     "profile": {
  //       "name": "Administrator",
  //       "settings": {
  //         "allow_account_creation": false,
  //         "mentoring_system": false
  //       }
  //     },
  //     'settings': {
  //       'alert_numbers': [],
  //       'event_stage': 'registration'
  //     }
  //   });
  //   // give the admin admin rights
  //   var adminUser = Meteor.users.findOne({ "_id":admin_id });
  //   Roles.addUsersToRoles(adminUser, 'admin');
  // }

  // Prevent non-authorized users from creating new users:
  // Accounts.validateNewUser(function (user) {
  //   if (Meteor.users.findOne({ "_id":admin_id }).profile.settings.allow_account_creation) {
  //     return true;
  //   }
  //   throw new Meteor.Error(403, "Not authorized to create new users");
  // });
  
  
  /**
   * Set the environment variable to send mail
   */
  process.env.MAIL_URL = Meteor.settings.mail_url;


  // Repeating Server Actions ==================================================

  // show check for new announcements to show every 30 seconds
  Meteor.setInterval(function() {
    Meteor.call("showAnnouncements");
  }, 10*1000);

  // assign free mentors to hackers in the queue every 60 seconds
  Meteor.setInterval(function() {
    Meteor.call("assignMentors");
  }, 10*1000);

  // ===========================================================================
});
