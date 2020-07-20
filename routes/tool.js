const express = require('express');
const router = express.Router();
const { getTool } = require('../controllers/tool');

router.route('/tool/:asset_tag').get(getTool);

module.exports = router;
