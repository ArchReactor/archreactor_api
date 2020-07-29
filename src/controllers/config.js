const settings = require('../settings/settings');

exports.getConfig = (req, res, next) => {
  if (req.query.api_key !== undefined) {
    settings.getSettings().api_key = req.query.api_key;
    settings.getSettings().key = req.query.key;
    settings.getSettings().url = req.query.url;
    settings.getSettings().snipeit = {
      token: req.query.token,
    };
    settings.save();
  }
  res.send(`
  <form>
    <label for="api_key">CivicCRM Api Key</label>
    <input id="api_key" name="api_key" type="text" value="${
      settings.getSettings().api_key
    }"><br>
    <label for="key">CivicCRM Key</label>
    <input id="key" name="key" type="text" value="${
      settings.getSettings().key
    }"><br>
    <label for="url">CivicCRM Rest URL</label>
    <input id="url" name="url" type="text" value="${
      settings.getSettings().url
    }"><br>
    <label for="token">Snipe-IT Token</label>
    <input id="token" name="token" type="text" value="${
      settings.getSettings().snipeit.token
    }"><br>
    <input type="submit">
  </form>
  ${JSON.stringify(settings.getSettings(), null, 3)}
  `);
};
