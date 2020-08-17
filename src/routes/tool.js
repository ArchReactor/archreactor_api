const express = require('express');
const router = express.Router();
const ipfilter = require('express-ipfilter').IpFilter;
const { getTool, checkoutTool } = require('../controllers/tool');

const localOnlyRule = ipfilter(['192.168.*.*', '127.0.0.1', '::1'], {
  mode: 'allow',
});

router.route('/tool/:asset_tag').get(getTool);

router
  .route('/tool/:asset_tag/checkout/:card_id')
  .get(localOnlyRule, checkoutTool);

module.exports = router;
