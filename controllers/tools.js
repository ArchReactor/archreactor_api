const request = require('request');
const settings = require('../settings/settings');
const snipeit = require('../snipeit/snipeit');

exports.getTools = (req, res, next) => {
  let headers = {
    Authorization: `Bearer ${settings.getSettings().snipeit.token}`,
  };
  request(
    { url: 'http://tools.archreactor.net/api/v1/hardware', headers: headers },
    function (error, response, body) {
      if (response && response.statusCode == 200) {
        try {
          let tools = snipeit.parseTools(body);
          res.json(tools);
        } catch (e) {
          console.log(e);
          res.status(500).send(body);
        }
      } else {
        let errorMessage = {
          msg: 'Error, check /config. Message was: ' + JSON.stringify(error),
        };
        res.send(JSON.stringify(errorMessage));
      }
    }
  );
};
