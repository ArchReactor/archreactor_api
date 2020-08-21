const request = require('request');
const settings = require('../settings/settings');
const snipeit = require('../snipeit/snipeit');
const axios = require('axios');
const { response } = require('express');

exports.checkForErrors = (req, res, next) => {
  if (settings.getSettings().snipeit.token == undefined) {
    let errorMessage = {
      msg: 'Missing Snipe it Token. Check config.',
    };
    return res.status(500).json(errorMessage);
  }
  next();
};

exports.getTool = (req, res, next) => {
  let headers = {
    Authorization: `Bearer ${settings.getSettings().snipeit.token}`,
  };
  let url =
    'http://tools.archreactor.net/api/v1/hardware/bytag/' +
    req.params.asset_tag;
  axios
    .get(url, { headers: headers })
    .then((response) => {
      let tools = snipeit.snipeitToolToArchReactorTool(response.data);
      res.json(tools);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

exports.checkoutTool = (req, res, next) => {
  const url = settings.getSettings().nodered.url;
  axios
    .get(
      `${url}?card_id=${req.params.card_id}&asset_tag=${req.params.asset_tag}`
    )
    .then((response) => {
      res.json(response.data);
    });
};

exports.checkinTool = (req, res, next) => {
  let headers = {
    Authorization: `Bearer ${settings.getSettings().snipeit.token}`,
  };
  let config = {
    headers: headers,
  };
  let url =
    'http://tools.archreactor.net/api/v1/hardware/bytag/' +
    req.params.asset_tag;

  axios.get(url, config).then((response) => {
    let url = `http://tools.archreactor.net/api/v1/hardware/${response.data.id}/checkin`;
    axios
      .post(url, {}, config)
      .then((response) => {
        res.json(response.data);
      })
      .catch((error) => {
        res.json(error);
      });
  });
};
