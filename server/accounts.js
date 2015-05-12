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

Accounts.validateNewUser(function(user) {
	if (_.contains(user.roles, 'admin') || _.contains(user.roles, 'announcer'))
		return false;
	else
		return true;
});
