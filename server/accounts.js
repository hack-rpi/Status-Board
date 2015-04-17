// Prevent non-authorized users from creating new users:
Accounts.validateNewUser(function (user) {
	if (Meteor.users.findOne({ "_id":admin_id }).profile.settings.allow_account_creation) {
		return true;
	}
	throw new Meteor.Error(403, "Not authorized to create new users");
});

// Construct new users, add to roles, and validate new user data
Accounts.onCreateUser(function(options, user) {
	user.profile = options.profile;
	user.settings = {};
	if (options.profile.role == "hacker")
		user.roles = ["hacker"];
	else if (options.profile.role == "mentor")
		user.roles = ["mentor"];
	else if (options.profile.role == "volunteer")
		user.roles = ["volunteer"];
	return user;
});
