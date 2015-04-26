Template.user_announcements.rendered = function() {
  this.$('.datetimepicker').datetimepicker();
}

Template.user_announcements.helpers({
  announcements: function() {
    Meteor.subscribe("Announcements");
    return Announcements.find();
  }
});

Template.user_announcements.events({
  'click #addAnnouncementBtn': function() {
    var header = $('#inputHeader').val();
    var body = $('#inputBody').val();
    var startTime = $('#inputStartTime').val();

    startTime = new Date(startTime);

    if (Announcements.insert({
        header: header,
        text: body,
        startTime: startTime,
        fStartTime: startTime.toLocaleString(),
        visible: false
      })) {
      Session.set('displayMessage', {
  			title: 'Success',
  			body: 'Announcement added.'
  		});
      $('#inputHeader').val('');
      $('#inputBody').val('');
      $('#inputStartTime').val('');
    } else {
      Session.set('displayMessage', {
  			title: 'Error',
  			body: 'Announcement could not be added.'
  		});
    }
  },

  'click .removeAnnouncement': function() {
    Meteor.subscribe("Announcements");
    if (confirm("Permanently delete this announcement?")) {
      Announcements.remove({ _id:this._id })
    }
  }

});
