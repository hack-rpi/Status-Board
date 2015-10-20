Session.setDefault('currentAnnouncement', 0);

Template.jumbotron.helpers({
  showJumbo: function() {
    Meteor.subscribe("Announcements");
    if (Announcements.find({visible:true}).count() === 0) {
      return false;
    }
    else {
      return true;
    }
  },
  announcements: function() {
    Meteor.subscribe("Announcements");
    return Announcements.find({ visible:true }, {sort: {startTime: -1}}).fetch();
  },
  showAnnouncement: function(index) {
    return Session.get('currentAnnouncement') === index;
  }
});

Template.jumbotron.events({
  'click .next-announcement': function(e) {
    var nextAnnouncement = Session.get('currentAnnouncement') + 1;
    var numAnnouncements = Announcements.find({visible:true}).count()
    if(nextAnnouncement < numAnnouncements) {
      Session.set('currentAnnouncement', nextAnnouncement);
    }
  },
  'click .prev-announcement': function(e) {
    var prevAnnouncement = Session.get('currentAnnouncement') - 1;
    if(prevAnnouncement >= 0) {
      Session.set('currentAnnouncement', prevAnnouncement);
    }
  }
});