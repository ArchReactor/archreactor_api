const Keycloak = require('keycloak-connect');
const express = require('express');
const session = require('express-session');
const usersRoute = require('./routes/users');
const userRoute = require('./routes/user');
const toolRoute = require('./routes/tool');
const toolsRoute = require('./routes/tools');
const { getConfig } = require('./controllers/config.js');

const PORT = process.env.PORT || 3000;

const app = express();

// Setup routes
app.use('', usersRoute);
app.use('', userRoute);
app.use('', toolRoute);
app.use('', toolsRoute);

app.set('view engine', 'html');
app.set('views', require('path').join(__dirname, '/view'));

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

app.get('/', function (req, res) {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
