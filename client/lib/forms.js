Forms = (function() {
  var api = {};

  // trim helper
  api.trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  };

  // valid password as per requirements
  api.isValidPassword = function(val) {
     return val.length >= 6;
  };

  // validate input email
  api.isValidEmail = function(email) {
  	return email.length > 6 && email.search("@");
  };

  api.stripPhone = function(phone) {
    return phone;
  };

  api.highlightError = function($input, $error_box) {
    if ($error_box) {
      $error_box.velocity('transition.bounceIn', 200);
    }
    $input
      .addClass('has-form-error')
      .velocity('callout.shake', 500)
      .one('click', function() {
        $input.removeClass('has-form-error');
        if ($error_box) {
          $error_box
            .velocity('transition.bounceOut', 500);
        }
      });
    return;
  };

  return api;
})();
