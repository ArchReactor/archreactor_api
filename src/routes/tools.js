const express = require('express');
const router = express.Router();
const { getTools } = require('../controllers/tools');

router.route('/tools').get(getTools);

module.exports = router;
