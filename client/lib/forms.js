// trim helper
trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
};

// valid password as per requirements
isValidPassword = function(val) {
   return val.length >= 6;
};

// validate input email
isValidEmail = function(email) {
	return email.length > 6 && email.search("@");
};

// trim whitespace from the input
trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
};

stripPhone = function(phone) {
  return phone;
};
