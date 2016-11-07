Template.confirm.rendered = () => {
  Meteor.subscribe('UserData', Meteor.userId());
};

Template.confirm.helpers({
  accepted: () => {
    try {
      return Meteor.user().settings.accepted.flag;
    } catch (e) {
      return false;
    }
  },
  confirmed: () => {
    try {
      return Meteor.user().settings.confirmed.flag;
    } catch (e) {
      return false;
    }
  },
  expire_date: () => {
    try {
      return Meteor.user().settings.accepted.expires.toDateString();
    } catch (e) {
      return '';
    }
  },
  travel: () => {
    try {
      const method = Meteor.user().settings.accepted.travel.method;
      if (method.search(/bus/gi) !== -1) {
        return method;
      }
      return '';
    } catch (e) {
      return '';
    }
  },
  reimbursement: () => {
    try {
      return Meteor.user().settings.accepted.travel.reimbursement;
    } catch (e) {
      return '';
    }
  },
  is_on_bus: () => {
    try {
      if (Meteor.user().settings.accepted.travel.method.search(/bus/gi) !== -1) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
  bus_info_link: () => {
    try {
      if (Meteor.user().settings.accepted.travel.method.search(/bus/gi) !== -1) {
        return Meteor.settings.public.bus_info_link;
      }
      return '#';
    } catch (e) {
      return '#';
    }
  },
});

Template.confirm.events({
  'change input[name="travel"]': (event) => {
    const val = $(event.target).attr('value');
    if (val === 'reject') {
      $('#travel-explaination').show();
    } else {
      $('#travel-explaination').hide();
    }
  },
  'click .btn[data-action="confirm"]': () => {
    const acceptTravel = $('#accept-travel input:checked').attr('value') === 'accept';
    const $explaination = $('#travel-explaination input');
    const explaination = $explaination.val();
    if (!acceptTravel && explaination === '') {
      Forms.highlightError($explaination);
      return;
    }
    Meteor.call('userConfirmAcceptance', acceptTravel, explaination, (err) => {
      if (err) {
        Session.set('displayMessage', {
          title: err.error,
          body: err.reason,
        });
      } else {
        Session.set('displayMessage', {
          title: 'You did it!',
          body: 'We can\'t wait to see you at HackRPI! We will be in touch shortly about travel' +
            ' arrangements, if applicable.',
        });
      }
    });
  },
  'click .btn[data-action="reject"]': () => {
    if (confirm('Are you sure you want to give up your spot at HackRPI?')) {
      Meteor.call('userRejectAcceptance', (err) => {
        if (err) {
          Session.set('displayMessage', {
            title: err.error,
            body: err.reason,
          });
        } else {
          Session.set('displayMessage', {
            title: 'You have relinquished your spot.',
            body: 'We\'re sorry to hear that you won\'t be joining us this year. Perhaps we will' +
              ' see you next year!',
          });
        }
      });
    }
  },
});
