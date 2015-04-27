// Global API Configuration
Restivus.configure({
	useAuth: false,
	prettyJson: true
});

Restivus.addRoute('CommitMessages', { authRequired: true}, {
	get: function() {
		console.log("GEEEET!");
		return {
			status: 'success',
			data: []
		};
	},
	post: {
		action: function() {
			console.log("POOOOOST!");
			return {
				status: 'success',
				data: []
			};
		}
	}
});
