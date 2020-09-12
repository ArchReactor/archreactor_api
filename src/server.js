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

// Check for Errors
app.use('', checkSettings);

// Setup routes
app.use('', usersRoute);
app.use('', userRoute);
app.use('', toolRoute);
app.use('', toolsRoute);

app.use('/', express.static('public'));

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

app.get('/config', keycloak.protect(), getConfig);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
