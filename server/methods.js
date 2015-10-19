Meteor.methods({
	// checks to see if the given url is valid or not with a simple get request
	// returns an error if invalid or the request responce if valid
	isValidUrl: function(url) {
		try {
			return Meteor.http.get(url, {
				headers: {
					'User-Agent': 'Meteor/1.1'
				}
			});
		}
		catch (e) {
			throw new Meteor.Error('Invalid Url', 'Input URL is not valid.');
		}
	},

	showAnnouncements: function() {
		// use this to update which announcements should be visible
		var msgs = Announcements.find({ 'visible': false }).fetch(),
				d = new Date(); // current time
		for (var i=0; i<msgs.length; i++) {
			// check if it's time to show this announcement
			if (d > msgs[i].startTime) {
				Announcements.update({_id:msgs[i]._id},
					{$set: {visible:true}});
			}
		}
	},

	assignMentors: function() {
		// loop over the queue sorted by oldest to most recent
		// console.log("assigning mentors...");

		var reqs = MentorQueue.find({ "completed":false }).fetch();
		var Q = reqs.sort(function(a,b) { return a.timestamp < b.timestamp; } );

		var mentors = Meteor.users.find({ $and: [
			{ "roles": "mentor" },
			{ "profile.active": true },
			{ "profile.available": true }
		] }).fetch();

		// console.log("Mentors available: ", mentors.length);

		// bail if there are no available mentors
		if (mentors.length == 0)
			return;

		// we can either wait for the best fit mentor to be available, or just
		// go with the next available mentor who best fits the person's needs
		// >> Let's go with the former
		for (var i=0; i<Q.length; i++) {
			// refresh this everytime
			mentors = Meteor.users.find({ $and: [
				{ "profile.role": "mentor" },
				{ "profile.active": true },
				{ "profile.available": true }
			] }).fetch();

			if (mentors.length == 0)
				return;

			var matched_id = "";
			var h_tag = Q[i]["tag"];
			// loop over the available mentors
			for (var m=0; m<mentors.length; m++) {
				// check the tags of this mentor
				var m_tags = mentors[m]["profile"]["tags"];
				for (var t in m_tags) {
					if (m_tags[t] == h_tag)
						matched_id = mentors[m]["_id"];
				}
			}

			// if we couldn't find an available mentor for this person then skip him
			if (matched_id == "")
				break;

			var matched_mentor = Meteor.users.find({ '_id':matched_id }).fetch()[0];
			// console.log("found a match for hacker ", Q[i]["name"], " with ", matched_mentor["profile"]["name"]);

			// otherwise we found a mentor
			// now we assign the mentor to the hacker
			// send a text to the mentor to tell them where to go
			var msg = Q[i].name + " needs your help with " + h_tag + "!" + " S/he can be found at " + Q[i].loc;
			Meteor.call("sendText", matched_mentor.profile.phone, msg);

			// mark the mentor as busy and give him a pointer to his task
			Meteor.users.update({ '_id':matched_id }, {
				$set: {
					'profile.available': false,
					'profile.mentee_id': Q[i]['_id']
				}
			});

			// send a text to the hacker to tell them that a mentor is on his way
			if (Q[i].phone != "") {
				msg = matched_mentor.profile.name + " from " + matched_mentor.profile.affiliation + " is on his way to assist you!";
				Meteor.call("sendText", Q[i].phone, msg);
			}

			// remove the hacker from the queue
			MentorQueue.update({ _id:Q[i]._id }, {
				$set: { "completed": true }
			});

			// aaaaand ya done

		} // end Q loop

	},

	sendText: function(toNum, msg) {
		var SID = Meteor.settings.twilio_SID,
				token = Meteor.settings.twilio_token,
				url = "https://api.twilio.com/2010-04-01/Accounts/" +
					Meteor.settings.twilio_SID + "/SMS/Messages.json",
				fromNum = Meteor.settings.twilio_from_num;
		toNum = toNum.replace("-","");

		try {
			return Meteor.http.post(url, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				auth: SID + ":" + token,
				params: {
					From: fromNum,
					To: "+1" + toNum,
					Body: msg
				}
			});
		}
		catch(err) {
			console.log('Twilio API Error!');
			console.log(err);
			return false;
		}
	},

	upVoteCommit: function(commit_id, user_id) {
		if (! user_id) {
			throw new Meteor.Error('Invalid Vote',
				'You must login before you can vote.');
		}
		var record = CommitMessages.findOne({ '_id': commit_id,
			'flags': { $elemMatch: { 'id': user_id } } });
		// check if this user has flagged this commit before
		// can only vote once
		if (! record) {
			CommitMessages.update({ '_id': commit_id }, {
				$inc: {
					total_flags: 1
				},
				$addToSet: {
					flags: {
						id: user_id
					}
				}
			});
			Meteor.users.update({ '_id': user_id }, {
				$addToSet: {
					'profile.flags': commit_id
				}
			});
		}
		else {
			throw new Meteor.Error('Invalid Vote',
				'Only one vote per commit message.');
		}
	},

	removeVoteCommit: function(commit_id, user_id) {
		if (! user_id) {
			throw new Meteor.Error('Invalid Vote',
				'You must login before you can vote.');
		}
		var record = CommitMessages.findOne({ '_id': commit_id,
			'flags': { $elemMatch: { 'id': user_id } } });
		// check if this user has flagged this commit before
		if (record) {
			CommitMessages.update({ '_id': commit_id }, {
				$inc: {
					total_flags: -1
				},
				$pull: {
					flags: {
						id: user_id
					}
				}
			});
			Meteor.users.update({ '_id': user_id }, {
				$pull: {
					'profile.flags': commit_id
				}
			});
		}
		else {
			throw new Meteor.Error('Invalid Vote', 'Cannot remove null vote.');
		}
	},

	sendAlerts: function(alertMsg) {
		var numbers = Meteor.users.findOne({ '_id': admin_id }).settings
			.alert_numbers;
		_.each(numbers, function(num) {
			Meteor.call('sendText', num, alertMsg);
		});
	},

	getEventState: function() {
		return Meteor.users.findOne({ _id: admin_id }).settings.event_stage;
	},
	
	validateCheckInCode: function(code) {
		return Meteor.settings.checkin_code === code;
	},
	
	checkInUser: function(code, email) {
		try {
			if (! Meteor.call('validateCheckInCode', code)) {
				throw new Meteor.Error('Access Denied', 
					'A valid check in code must be provided to check in a user.');
			}
			var userDoc =  Meteor.users.findOne({ 
				emails: {
					$elemMatch: { address: email } 
				} 
			});
			if (userDoc) {
				Meteor.users.update({ _id: userDoc._id }, {
					$set: {
						checked_in: true
					}
				});
				return true;
			}
			else {
				throw new Meteor.Error('Invalid Email', 
					'No user found with email: ' + email);
			}
		}
		catch (e) {
			throw e;
		}
	}

});
