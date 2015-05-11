Meteor.methods({
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

		var d = new Date(year,month,day,hour,min,sec);
		d = d.toLocaleString(0,24);

		return d.substr(0,24);
	}
});
