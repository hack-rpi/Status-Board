Template.anonReportForm.events({
	'click #anonReportBtn': function() {
		$('#anonReportForm').modal('hide');
		var descrip = $('#anon-input').val();
		$('#anon-input').val('');
		if (! descrip) return;
		AnonReports.insert({
			text: descrip,
			addressed: false
		});
		Session.set('displayMessage', {
			title: 'Report Filed',
			body: 'You have successfully submitted an anonymous report. It shall ' +
				'addressed with due haste. We appreciate your concern.'
		});
	}
});
