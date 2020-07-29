const parseContacts = (jsonString) => {
  let contacts = JSON.parse(jsonString);
  let users = [];
  contacts.values.forEach((element) => {
    let user = civicCRMUserToArchReactorUser(element);
    users.push(user);
  });
  return users;
};

const civicCRMUserToArchReactorUser = (civicUser) => {
  var volunteer_status = '1';
  if (civicUser.custom_37 !== '1') {
    volunteer_status = '0';
  }
  return {
    user_id: civicUser.contact_id,
    groups: civicUser.groups,
    name: civicUser.display_name,
    card_id: civicUser.custom_12,
    volunteer_status: volunteer_status,
  };
};

exports.parseContacts = parseContacts;
exports.civicCRMUserToArchReactorUser = civicCRMUserToArchReactorUser;
