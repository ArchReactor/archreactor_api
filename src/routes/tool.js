const express = require('express');
const router = express.Router();
const ipfilter = require('express-ipfilter').IpFilter;
const {
  getTool,
  checkoutTool,
  checkinTool,
} = require('../controllers/tool');

const localOnlyRule = ipfilter(
  [
    '::fff:0.0.0.0/1',
    '::fff:0.8.0.0/1',
    '::fff:128.0.0.0/2',
    '::fff:192.0.0.0/3',
    '::fff:224.0.0.0/4',
    '127.0.0.1',
    '::ffff:127.0.0.1',
    '::1',
  ],
  {
    mode: 'allow',
  }
);

router.route('/tool/:asset_tag').get(getTool);

router
  .route('/tool/:asset_tag/checkout/:card_id')
  .get(localOnlyRule, checkoutTool);

router
  .route('/tool/:asset_tag/checkin')
  .get(localOnlyRule, checkinTool);

module.exports = router;
