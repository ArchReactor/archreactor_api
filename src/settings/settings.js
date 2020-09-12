const fs = require('fs');

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

const checkSettings = (req, res, next) => {
  const missing = []
  for(const property in settings){
    if(!settings[property]){
      missing.push(property)
    } else {
      for(const childProp in settings[property]){
        missing.push(`${property}: ${childProp}`)
      }
    }
  }
  if(missing.length > 0){
    var url = req.protocol + '://' + req.get('host');
    let errorMessage = {
      msg: `Missing ${missing}. Check config at ${url}/config.`,
    };
    return res.status(500).json(errorMessage);
  }

  next();
};

module.exports = { getSettings, save, checkSettings };
