const request = require('request');
const settings = require('../settings/settings');
const snipeit = require('../snipeit/snipeit');
const { response } = require('express');

exports.getTool = (req, res, next) => {
  let headers = {
    Authorization: `Bearer ${settings.getSettings().snipeit.token}`,
  };
  if (req.params.asset_tag !== undefined) {
    request(
      {
        url:
          'http://tools.archreactor.net/api/v1/hardware/bytag/' +
          req.params.asset_tag,
        headers: headers,
      },
      function (error, response, body) {
        if (response && response.statusCode == 200) {
          try {
            let tools = snipeit.snipeitToolToArchReactorTool(JSON.parse(body));
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
  } else {
    request(
      { url: 'http://tools.archreactor.net/api/v1/hardware', headers: headers },
      function (error, response, body) {
        if (response && response.statusCode == 200) {
          try {
            let tools = parseTools(body);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(tools, null, 3));
          } catch (e) {
            res.send('ERR');
          }
        } else {
          let errorMessage = {
            msg: 'Error, check /config. Message was: ' + JSON.stringify(error),
          };
          res.send(JSON.stringify(errorMessage));
        }
      }
    );
  }
};

exports.checkoutTool = (req, res, next) => {
  const url = settings.getSettings().nodered.url;
  request(
    {
      url: `${url}?card_id=${req.params.card_id}&asset_tag=${req.params.asset_tag}`,
    },
    (error, response, body) => {
      res.json(JSON.parse(body));
    }
  );
};
