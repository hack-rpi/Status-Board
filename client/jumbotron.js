if (Meteor.isClient) {

  Template.jumbotron.helpers({

    showJumbo: function() {
      Meteor.subscribe("Announcements");
      if (Announcements.find({visible:true}).fetch().length == 0) {
        return false;
      }
      else {
        return true;
      }
    },

    announcements: function() {
      Meteor.subscribe("Announcements");
      return Announcements.find({ visible:true }).fetch();
    }

  });

}
