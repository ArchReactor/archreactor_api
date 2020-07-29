const request = require('request');
const express = require('express');
const router = express.Router();
const settings = require('../settings/settings');
const civicCRM = require('../civiccrm/utils');

router.get('/users', (req, res) => {
  let cardID = req.query.card_id === undefined ? '' : req.query.card_id;
  let group = req.query.group === undefined ? '' : req.query.group;
  let name = req.query.name === undefined ? '' : req.query.name;
  let json = `{
    "sequential": 1,
    "custom_12": "${cardID}",
    "group": "${group}",
    "display_name": "${name}",
    "return": "id,display_name,custom_12,group,custom_37",
    "options": {
      "sort": "sort_name ASC",
      "limit": 20,
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
  request({ url: settings.getSettings().url, qs: payload }, function (
    error,
    response,
    body
  ) {
    if (response && response.statusCode == 200) {
      let contacts = civicCRM.parseContacts(body);
      res.setHeader('Content-Type', 'application/json');
      if (req.query.pretty === undefined) {
        res.send(JSON.stringify(contacts));
      } else {
        res.send(JSON.stringify(contacts, null, 3));
      }
    } else {
      let errorMessage = {
        msg: 'Error, check /config. Message was: ' + JSON.stringify(error),
      };
      res.send(JSON.stringify(errorMessage));
    }
  });
});

module.exports = router;
