const fs = require('fs');
const { Console } = require('console');

const settings = {
  api_key: '',
  key: '',
  url: '',
  snipeit: {
    token: '',
  },
  nodered: {
    url: '',
  },
};

fs.readFile('.config', 'utf8', (err, data) => {
  if (!err) {
    Object.assign(settings, JSON.parse(data));
    console.log('Setting loaded...');
  }
});

const getSettings = () => {
  return settings;
};

const save = () => {
  fs.writeFile('.config', JSON.stringify(settings), () => {});
};

module.exports = { getSettings, save };
