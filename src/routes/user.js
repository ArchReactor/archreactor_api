const express = require('express');
const router = express.Router();
const { getUserByCard } = require('../controllers/user.js');

router.route('/user/bycard/:card_id').get(getUserByCard);

module.exports = router;
