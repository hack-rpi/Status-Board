Meteor.subscribe('Announcements');
Session.setDefault('currentAnnouncement', 0);

Template.jumbotron.helpers({
  showJumbo: function() {
    if (Announcements.find({visible:true}).count() === 0) {
      return false;
    }
    else {
      return true;
    }
  },
  showPrev: function() {
    if(Session.get('currentAnnouncement') + 1 
      < Announcements.find({visible:true}).count()) {
      return true;
    }
    else {
      return false;
    }
  },
  showNext: function() {
    if(Session.get('currentAnnouncement') - 1 >= 0) {
      return true;
    }
    else {
      return false;
    }
  },
  announcements: function() {
    return Announcements.find({ visible:true }, {sort: {startTime: -1}}).fetch();
  },
  showAnnouncement: function(index) {
    return Session.get('currentAnnouncement') === index;
  }
});

Template.jumbotron.events({
  'click .next-announcement': function(e) {
    var nextAnnouncement = Session.get('currentAnnouncement') - 1;
    if(nextAnnouncement >= 0) {
      Session.set('currentAnnouncement', nextAnnouncement);
    }
  },
  'click .prev-announcement': function(e) {
    var prevAnnouncement = Session.get('currentAnnouncement') + 1;
    var numAnnouncements = Announcements.find({visible:true}).count()
    if(prevAnnouncement < numAnnouncements) {
      Session.set('currentAnnouncement', prevAnnouncement);
    }
  }
});