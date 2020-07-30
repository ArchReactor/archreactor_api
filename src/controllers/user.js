const request = require('request');
const settings = require('../settings/settings');
const civicCRM = require('../civiccrm/utils');
const { getUserByCard } = require('request');

exports.getUserByCard = (req, res) => {
  let json = `{
    "sequential": 1,
    "custom_12": "${req.params.card_id}",
    "return": "id,display_name,custom_12,group,custom_37",
    "options": {
      "sort": "sort_name ASC",
      "limit": 1,
      "offset": 0
    }
  }`;

  let payload = {
    api_key: settings.getSettings().api_key,
    key: settings.getSettings().key,
    entity: 'Contact',
    action: 'get',
    json: json,
  };
  request(
    { url: settings.getSettings().url, qs: payload },
    onContactReceived(res)
  );
};

function onContactReceived(res) {
  return function (error, response, body) {
    if (response && response.statusCode == 200) {
      let contacts = civicCRM.parseContacts(body);
      const contact = contacts[0];
      getMembership(res, contact);
    } else {
      let errorMessage = {
        msg: 'Error, check /config. Message was: ' + JSON.stringify(error),
      };
      res.send(JSON.stringify(errorMessage));
    }
  };
}

function getMembership(res, contact) {
  if (contact === undefined) {
    return res.sendStatus(404);
  }
  let payload = {
    api_key: settings.getSettings().api_key,
    key: settings.getSettings().key,
    contact_id: contact.user_id,
    entity: 'Membership',
    action: 'get',
    json: '1',
  };
  status = [
    'unknown',
    'unknown',
    'current',
    'grace',
    'expired',
    'pending',
    'unknown',
    'unknown',
  ];
  request(
    { url: settings.getSettings().url, qs: payload },
    (error, response, body) => {
      let membership = Object.values(JSON.parse(body).values)[0];
      delete membership.id;
      delete membership.contact_id;
      delete membership.is_test;
      delete membership.is_pay_later;
      delete membership.membership_name;
      delete membership.source;
      contact.membership = membership;
      contact.membership.membership_status =
        status[contact.membership.status_id];
      return res.json(contact);
    }
  );
}
