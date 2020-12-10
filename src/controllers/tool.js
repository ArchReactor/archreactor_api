const settings = require('../settings/settings');
const snipeit = require('../snipeit/snipeit');
const axios = require('axios');

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
  const fullUrl = `${url}?card_id=${req.params.card_id}&asset_tag=${req.params.asset_tag}`;

  axios
    .get(fullUrl)
    .then((response) => {
      // Copy status from Node Red and return
      res.status(response.status);
      res.json(response.data);
    })
    .catch((err) => {
      // Copy status from Node Red and return
      res.status(err.response.status);
      res.json(err.response.data);
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
