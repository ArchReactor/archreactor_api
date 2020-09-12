const Keycloak = require('keycloak-connect');
const express = require('express');
const session = require('express-session');
const usersRoute = require('./routes/users');
const userRoute = require('./routes/user');
const toolRoute = require('./routes/tool');
const toolsRoute = require('./routes/tools');
const { getConfig } = require('./controllers/config.js');
const { checkSettings } = require('./settings/settings.js');

const PORT = process.env.PORT || 3000;

const app = express();

// Setup Keycloak
var memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

var keycloak = new Keycloak({ store: memoryStore });

app.use(keycloak.middleware());

// Check for Errors
app.use((req, res, next) => {
  if(req.path === '/config'){
    return next();
  } else {
    return checkSettings(req, res, next);
  }
});

// Setup routes
app.use('', usersRoute);
app.use('', userRoute);
app.use('', toolRoute);
app.use('', toolsRoute);
app.use('/', express.static('public'));
app.get('/config', keycloak.protect(), getConfig);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
