Template.user.rendered = function() {
  Session.set("user-page", "user-profile-btn");
  $(".user-sidebar-btn").removeClass("active");
  $("#user-profile-btn").addClass("active");
};

Template.user.helpers({
  user_page: function() {
    var page = Session.get("user-page");
    $(".user-sidebar-btn").removeClass("active");
    $("#"+page).addClass("active");
    if (page == "user-settings-btn")
      return "user_settings";
    else if (page == "user-hacker-btn")
      return "user_hacker";
    else if (page == "user-mentor-btn")
      return "user_mentor";
    else if (page == "user-volunteer-btn")
      return "user_volunteer";
    else if (page == "user-announcements-btn")
      return "user_announcements";
    else if (page == "user-database-btn")
      return "user_database";
    else if (page == "user-server-settings-btn")
      return "user_server_settings";
    else {
      $("#user-profile-btn").addClass("active");
      return "user_profile";
    }
  },
});

Template.user.events({
  'click .user-sidebar-btn': function(e) {
    Session.set("user-page", e.currentTarget.id);
  }
});
