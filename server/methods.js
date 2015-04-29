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

	getCommit: function(username, repo) {
		var token = Meteor.settings.github_API_token;
		var url = "https://api.github.com/repos/" + username + "/" + repo + "/commits";
		try {
			return Meteor.http.get(url, {
				headers: {
					"User-Agent": "Meteor/1.0"
				},
				params: {
					access_token: token
				}
			});
		}
		catch(err) {
			return false;
		}
	},

	addCommits: function(username, repo) {
		// make a synchronous call (blocking)
		var result = Meteor.call('getCommit', username, repo);
		if (result.statusCode != 200) {
			console.log("ERROR connecting to Github API");
		}
		else {
			var data = JSON.parse(result.content);
			// loop over all the commits that were found
			// STOP if we get to something we've already added
			for (var i=0; i<data.length; i++) {
				// get sha and check if it's already in the database
				var commit_sha = data[i]['sha'];
				// check if this commit is already added to the db
				if ( CommitMessages.find({ sha: commit_sha }).fetch().length != 0 ) {
					// all of the rest will not be new either so stop here
					break;
				}
				// if this sha doesn't already exist in the database then it is new
				else {
					// capture and store all of the data
					// sometimes the 'committer' field is null... not sure why
					//  but we have to check everytime if it is
					var v_date = Meteor.call('validateDate', data[i]['commit']['committer']['date']);
					CommitMessages.insert({
						sha : commit_sha,
						text : data[i]['commit']['message'],
						date : v_date,
						fdate :  Meteor.call('formatDateTime', v_date),
						repo: repo,
						committer_handle : data[i]['committer'] ? data[i]['committer']['login'] : data[i]['commit']['committer']['name'],
						committer_avatar : data[i]['committer'] ? data[i]['committer']['avatar_url']: null,
						committer_real : data[i]['commit']['committer']['name'],
						committer_url : data[i]['author']['html_url'],
						repo_url : "https://github.com/" + username + '/' + repo,
						// probably not a good a idea to store emails?
						// (do I have access to all of them?)
						committer_email : data[i]['commit']['committer']['email'],
						flags: [],
						total_flags: 0
					});
				}
			}
		}
	},

	refreshCommitsAllRepos: function() {
		// loop over all the repos in the database and check for new commit messages
		var stored_repos = RepositoryList.find().fetch();
		for (var i=0; i<stored_repos.length; i++) {
			var owner = stored_repos[i]["owner"];
			var name = stored_repos[i]["name"];
			Meteor.call("addCommits", owner, name);
		}
	},

	validateDate: function(dt) {
		// if a commit has a date in the future compared to the server time, then
		//  assign it the server time
		var now = new Date();
		now.setHours( now.getHours() + 5 ); // UTC
		if (dt > now) {
			dt = now;
		}
		return dt;
	},

	formatDateTime: function(dt) {
		var year  = parseInt(dt.substr(0,4),10);
		var month = parseInt(dt.substr(5,2),10);
		var day   = parseInt(dt.substr(8,2),10);
		var hour  = parseInt(dt.substr(11,2),10);
		var min   = parseInt(dt.substr(14,2),10);
		var sec   = parseInt(dt.substr(17,2),10);
		month--; // JS months start at 0
		hour -= 5; // timezone difference

		var d = new Date(year,month,day,hour,min,sec);
		d = d.toLocaleString(0,24);

		return d.substr(0,24);
	},

	showAnnouncements: function() {
		// use this to update which announcements should be visible
		var msgs = Announcements.find().fetch();
		for (var i=0; i<msgs.length; i++) {
			var d = new Date(); // current time
			if (msgs[i].visible) {
				// check if the time is up on this announcement
				if (d > msgs[i].endTime)
					Announcements.remove({_id:msgs[i]._id});
			}
			else {
				// check if it's time to show this announcement
				if (d > msgs[i].startTime)
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
			{ "profile.role": "mentor" },
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
		var SID = Meteor.settings.twilio_SID;
		var token = Meteor.settings.twilio_token;
		var url = "https://api.twilio.com/2010-04-01/Accounts/" + Meteor.settings.twilio_SID + "/SMS/Messages.json"
		var fromNum = Meteor.settings.twilio_from_num;
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

	retrieveMessages: function() {
		var SID = Meteor.settings.twilio_SID;
		var token = Meteor.settings.twilio_token;
		var url = "https://api.twilio.com/2010-04-01/Accounts/" + Meteor.settings.twilio_SID + "/SMS/Messages.json"
		var fromNum = Meteor.settings.twilio_from_num;

		try {
			return Meteor.http.get(url, {
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				auth: SID + ":" + token
			});
		}
		catch(err) {
			console.log('Twilio API Error!');
			console.log(err);
			return false;
		}
	},

	checkMentorResponses: function() {
		var msgs = Meteor.call("retrieveMessages");
		if (!msgs)
			return;

		var texts = msgs.data.sms_messages;
		var now = new Date();
		var past = new Date(now.getTime() - 60000); // Date object 60 seconds in the past

		for (var t=0; t<texts.length; t++) {
			// since this function is called every 60 seconds, only look at the messages
			// from the last 60 seconds
			var t_date = new Date(texts[t].date_sent.substring(0,26));
			t_date = new Date(t_date.getTime() - 5*60*60000); // timezone offset

			if (past > t_date)
				break;

			if (texts[t].direction == "inbound") {
				var m = texts[t].body.toUpperCase();
				var p = texts[t].from;
				p = p.substring(2,5) + "-" + p.substring(5,8) + "-" + p.substring(8);
				if (m == "DONE") {
					Meteor.users.update({ 'profile.phone':p }, {
						$set: { 'profile.available':true }
					});
				}
			}

		} // end for
	},

	giveUpVote: function(commit_id, user_id) {
		var msg = CommitMessages.find({ _id:commit_id }).fetch()[0];
		var record = CommitMessages.find({ _id:commit_id, "flags.id":user_id }).fetch();
		// check if this user has flagged this commit before
		if (record.length != 0) {
			// # of votes must be less than 5
			var votes = 0;
			for (var i=0; i<record[0]["flags"].length; i++) {
				if (record[0]["flags"][i]["id"] == user_id) {
					votes = record[0]["flags"][i]["num"];
					break;
				}
			}
			if (votes < 5) {
				CommitMessages.update({ _id:commit_id }, {
					$inc: {total_flags: 1},
				});
				CommitMessages.update({ _id:commit_id, "flags.id":user_id }, {
					$inc: {"flags.$.num": 1}
				});
			} // otherwise no more votes are allowed
		}
		// if this is the first vote then we must initialize a few things
		else {
			CommitMessages.update({ _id:commit_id }, {
				$inc: {total_flags: 1},
				$push: {flags: {
					id:user_id,
					num: 1
					}
				}
			});
		}
	},

	giveDownVote: function(commit_id, user_id) {
		var msg = CommitMessages.find({ _id:commit_id }).fetch()[0];
		var record = CommitMessages.find({ _id:commit_id, "flags.id":user_id }).fetch();
		// check if this user has flagged this commit before
		if (record.length != 0) {
			// # of votes must be less than 5
			var votes = 0;
			for (var i=0; i<record[0]["flags"].length; i++) {
				if (record[0]["flags"][i]["id"] == user_id) {
					votes = record[0]["flags"][i]["num"];
					break;
				}
			}
			if (votes > -5) {
				CommitMessages.update({ _id:commit_id }, {
					$inc: {total_flags: -1},
				});
				CommitMessages.update({ _id:commit_id, "flags.id":user_id }, {
					$inc: {"flags.$.num": -1}
				});
			} // otherwise no more votes are allowed
		}
		// if this is the first vote then we must initialize a few things
		else {
			CommitMessages.update({ _id:commit_id }, {
				$inc: {total_flags: -1},
				$push: {flags: {
					id:user_id,
					num: -1
					}
				}
			});
		}
	},

	createNewUser: function(username, email, roles, pass, real) {
		Accounts.createUser({
			'username': username,
			'email': email,
			'password': pass,
			'profile': {
				'name': real
			}
		});

		var newUser = Meteor.users.find( {username: username} ).fetch()[0];
		Roles.addUsersToRoles(newUser, roles);
		return true;
	},

	updateMentorStatus: function() {
		// loop over all the mentors and check if their statuses should be changed
		var mentors = Mentors.find().fetch();
		var now = new Date();
		for (var i=0; i<mentors.length; i++) {
			// if the mentor is currently active, check if her/his time is up
			if (mentors[i].active == true && now > mentors[i].endTime)
				Mentors.update({ _id:mentors[i]._id }, {
					$set: {active:false}
				});
			// if the mentor is currently not active check if s/he should be
			else if (mentors[i].active == false && now > mentors[i].startTime)
				Mentors.update({ _id:mentors[i]._id }, {
					$set: {active:true}
				});
			// update status
			var state = ( (mentors[i].available) &&
										(mentors[i].active || mentors[i].override) &&
										(!mentors[i].suspended || mentors[i].override) );
			Mentors.update({ _id:mentors[i]._id }, {
				$set: {status:state}
			});
		}
	},

});
