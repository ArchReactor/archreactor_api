var Keycloak = require('keycloak-connect');
var hogan = require('hogan-express');
const express = require("express");
var session = require('express-session');
const request = require('request');

const PORT = process.env.PORT || 3000;

const app = express();

// Register '.mustache' extension with The Mustache Express
app.set('view engine', 'html');
app.set('views', require('path').join(__dirname, '/view'));
app.engine('html', hogan);


const settings = {
  api_key: "",
  key: "",
  url: ""
}

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

var keycloak = new Keycloak({
  store: memoryStore
});


app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/',
  protected: '/protected/resource'
}));

app.get('/login', keycloak.protect(), function (req, res) {
  res.render('index', {
    result: JSON.stringify(JSON.parse(req.session['keycloak-token']), null, 4),
    event: '1. Authentication\n2. Login'
  });
});

app.get('/protected/resource', keycloak.enforcer(['resource:view', 'resource:write'], {
  resource_server_id: 'nodejs-apiserver'
}), function (req, res) {
  res.render('index', {
    result: JSON.stringify(JSON.parse(req.session['keycloak-token']), null, 4),
    event: '1. Access granted to Default Resource\n'
  });
});

app.get("/config", keycloak.protect(), (req, res) => {
  if(req.query.api_key !== undefined){
    settings.api_key = req.query.api_key
    settings.key = req.query.key
    settings.url = req.query.url
  }
  res.send(`
  <form>
    <label for="api_key">CivicCRM Api Key</label>
    <input id="api_key" name="api_key" type="text" value="${settings.api_key}"><br>
    <label for="key">CivicCRM Key</label>
    <input id="key" name="key" type="text" value="${settings.key}"><br>
    <label for="url">CivicCRM Rest URL</label>
    <input id="url" name="url" type="text" value="${settings.url}"><br>
    <input type="submit">
  </form>
  ${JSON.stringify(settings)}
  `)
})

app.get("/users", (req, res) => {
  let cardID = (req.query.card_id === undefined) ? "" : req.query.card_id
  let group = (req.query.group === undefined) ? "" : req.query.group
  let json = `{
    "sequential": 1,
    "custom_12": "${cardID}",
    "group": "${group}",
    "return": "id,display_name,custom_12,group,custom_37",
    "options": {
      "sort": "sort_name ASC",
      "limit": 20,
      "offset": 0
    }
  }`
  
  let payload = {api_key: settings.api_key, key: settings.key, entity: "Contact", action: "get", json: json }
  request({url: settings.url, qs: payload}, function (error, response, body) {
    if(response && response.statusCode == 200){
      let contacts = parseContacts(body)
      res.send(`
      <h1>Arch Reactor API</h1>
      ${JSON.stringify(contacts)}
      `);
    }
  });
});

function parseContacts(jsonString){
  let contacts = JSON.parse(jsonString)
  let users = []
  contacts.values.forEach(element => {
    let user = civicCRMUserToArchReactorUser(element)
    users.push(user)
  });
  return users
}

function civicCRMUserToArchReactorUser(civicUser) {
  var volunteer_status = "1"
  if(civicUser.custom_37 !== "1") {
    volunteer_status = "0"
  }
  return {
    user_id: civicUser.contact_id,
    groups: civicUser.groups,
    name: civicUser.display_name,
    card_id: civicUser.custom_12,
    volunteer_status: volunteer_status
  }
}

app.get('/', function (req, res) {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});