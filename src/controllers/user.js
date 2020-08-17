const request = require('request');
const settings = require('../settings/settings');
const civicCRM = require('../civiccrm/utils');
const { getUserByCard } = require('request');

const statusMap = [
  'unknown',
  'unknown',
  'current',
  'grace',
  'expired',
  'pending',
  'unknown',
  'unknown',
];

const ACTIVITY_TYPE_VOLUNTEER = 55;

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
      if (contact === undefined) {
        return res.sendStatus(404);
      }
      getVolunteerHours(contact).then((result) => {
        contact.volunteer_activities = result;
        getMembership(contact).then(
          (result) => {
            res.json(result);
          },
          (error) => {
            res.sendStatus(500);
          }
        );
      });
    } else {
      let errorMessage = {
        msg: 'Error, check /config. Message was: ' + JSON.stringify(error),
      };
      res.send(JSON.stringify(errorMessage));
    }
  };
}

function getMembership(contact) {
  return new Promise((resolve, reject) => {
    let payload = {
      api_key: settings.getSettings().api_key,
      key: settings.getSettings().key,
      contact_id: contact.user_id,
      entity: 'Membership',
      action: 'get',
      json: '1',
    };

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
          statusMap[contact.membership.status_id];
        resolve(contact);
      }
    );
  });
}

function getVolunteerHours(contact) {
  return new Promise((resolve, reject) => {
    let json = {
      activity_type_id: ACTIVITY_TYPE_VOLUNTEER,
      source_contact_id: contact.user_id,
    };
    let payload = {
      api_key: settings.getSettings().api_key,
      key: settings.getSettings().key,
      entity: 'Activity',
      action: 'get',
      json: JSON.stringify(json),
    };

    request(
      { url: settings.getSettings().url, qs: payload },
      (error, response, body) => {
        let activities = Object.values(JSON.parse(body).values);
        let volunteer_activities = activities.map((activity) => {
          return {
            civiccrm_id: activity.id,
            details: activity.details,
            duration: activity.duration,
            activity_date_time: activity.activity_date_time,
          };
        });
        resolve(volunteer_activities);
      }
    );
  });
}
