const request = require('request');
const express = require('express');
const router = express.Router();
const settings = require('../settings/settings');
const civicCRM = require('../civiccrm/utils');

router.get('/user/bycard/:card_id', (req, res) => {
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
});

module.exports = router;
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
    return res.send(404);
  }
  let payload = {
    api_key: settings.getSettings().api_key,
    key: settings.getSettings().key,
    contact_id: contact.user_id,
    entity: 'Membership',
    action: 'get',
    json: '1',
  };
  status = ['unknown', 'unknown', 'current', 'grace', 'expired', 'pending'];
  request(
    { url: settings.getSettings().url, qs: payload },
    (error, response, body) => {
      contact.membership = Object.values(JSON.parse(body).values)[0];
      contact.membership.membership_status =
        status[contact.membership.status_id];
      return res.json(contact);
    }
  );
}
