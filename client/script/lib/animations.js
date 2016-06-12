var createDiv = function(className) {
	var div = document.createElement('div');
	$div = $(div).addClass(className);
	return $div;
};

Animate = (function() {
	var api = {};

	api.Firework = function($parent) {
		$f = createDiv('a_firework')
			.css({
				position: 'relative',
				left: '25%',
				top: '100%',
				width: '3px',
				height: '10px',
				'background-color': '#000000'
			})
			.appendTo($parent)
			.velocity({
				top: '25%'
			}, { duration: 1500 });
	};

	return api;
})();
