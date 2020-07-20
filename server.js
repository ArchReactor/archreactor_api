var Keycloak = require('keycloak-connect');
var hogan = require('hogan-express');
const express = require('express');
var session = require('express-session');
const request = require('request');
const usersRoute = require('./routes/users');
const userRoute = require('./routes/user');
const toolRoute = require('./routes/tool');
const toolsRoute = require('./routes/tools');

const settings = require('./settings/settings');

const PORT = process.env.PORT || 3000;

const app = express();

// Setup routes
app.use('', usersRoute);
app.use('', userRoute);
app.use('', toolRoute);
app.use('', toolsRoute);

// Register '.mustache' extension with The Mustache Express
app.set('view engine', 'html');
app.set('views', require('path').join(__dirname, '/view'));
app.engine('html', hogan);

var memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

var keycloak = new Keycloak({
  store: memoryStore,
});

app.use(
  keycloak.middleware({
    logout: '/logout',
    admin: '/',
    protected: '/protected/resource',
  })
);

app.get('/login', keycloak.protect(), function (req, res) {
  res.render('index', {
    result: JSON.stringify(JSON.parse(req.session['keycloak-token']), null, 4),
    event: '1. Authentication\n2. Login',
  });
});

app.get(
  '/protected/resource',
  keycloak.enforcer(['resource:view', 'resource:write'], {
    resource_server_id: 'nodejs-apiserver',
  }),
  function (req, res) {
    res.render('index', {
      result: JSON.stringify(
        JSON.parse(req.session['keycloak-token']),
        null,
        4
      ),
      event: '1. Access granted to Default Resource\n',
    });
  }
);

app.get('/config', keycloak.protect(), (req, res) => {
  if (req.query.api_key !== undefined) {
    settings.api_key = req.query.api_key;
    settings.key = req.query.key;
    settings.url = req.query.url;
    settings.snipeit = {
      token: req.query.token,
    };
    fs.writeFile('.config', JSON.stringify(settings), () => {});
  }
  res.send(`
  <form>
    <label for="api_key">CivicCRM Api Key</label>
    <input id="api_key" name="api_key" type="text" value="${
      settings.api_key
    }"><br>
    <label for="key">CivicCRM Key</label>
    <input id="key" name="key" type="text" value="${settings.key}"><br>
    <label for="url">CivicCRM Rest URL</label>
    <input id="url" name="url" type="text" value="${settings.url}"><br>
    <label for="token">Snipe-IT Token</label>
    <input id="token" name="token" type="text" value="${
      settings.snipeit.token
    }"><br>
    <input type="submit">
  </form>
  ${JSON.stringify(settings, null, 3)}
  `);
});

app.get('/', function (req, res) {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
