// we have to wait until after the DOM is loaded AND after the commits have
// been sent to the client and the divs are created before we can call this
// function to mark the favorites
var markFavorites = function() {
	$('.commit-box').each(function() {
		if ($.inArray($(this).attr('commitId'),
				Meteor.user().profile.flags) != -1) {
			$('<i class="fa fa-bookmark fa-2x commit-bookmark"></i>')
				.appendTo($(this).parent());
			$('.commit-flag-count.' + $(this).attr('commitId')
				+ ' i[data-action="up-vote"]')
					.attr('data-action', 'remove-vote');
		}
	});
}

Template.commits.helpers({
	message: function() {
		// return only the ten most recent commits
		Meteor.subscribe("CommitMessages");
		var commits = CommitMessages.find({}, {sort: {date:-1}, limit:10});
		setTimeout(markFavorites,2000);
		return commits;
	},
});

Template.commits.events({
	'click .commit-flag-count i[data-action="up-vote"]': function() {
		var commitId = this._id;
		$('.commit-flag-count.' + commitId + ' i[data-action="up-vote"]')
			.attr('data-action', 'remove-vote');
		$('<i class="fa fa-bookmark fa-2x commit-bookmark">')
			.appendTo($('.commit-box[commitId="' + commitId + '"]').parent());
		Meteor.call('upVoteCommit', commitId, Meteor.userId(),
			function(error, result) {
				if (error) {
					Session.set('displayMessage', {
						title: error.error,
						body: error.reason
					});
				}
			}
		);
	},

	'click .commit-flag-count i[data-action="remove-vote"]': function() {
		var commitId = this._id;
		$('.commit-flag-count.' + commitId + ' i[data-action="remove-vote"]')
			.attr('data-action', 'up-vote');
		$('.commit-box[commitId="' + commitId + '"]')
			.parent().children().remove('.commit-bookmark');
		Meteor.call('removeVoteCommit', commitId, Meteor.userId(),
			function(error, result) {
				if (error) {
					Session.set('displayMessage', {
						title: error.error,
						body: error.reason
					});
				}
			}
		);
	}
});
