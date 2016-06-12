/**
 * client/script/pre-event/preregister.js
 */

Template.preregister.rendered = function() {
  Meteor.typeahead.inject();
  Meteor.subscribe('USColleges');
}

Template.preregister.helpers({
  schools: function() {
    return USColleges.find().fetch().map(function(d) { return d.name; });
  }
});
