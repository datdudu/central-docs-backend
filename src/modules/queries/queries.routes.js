const express = require('express');
const router = express.Router();
const queriesController = require('./queries.controller');
const authenticateToken = require('../../middlewares/auth');

router.post('/', authenticateToken, queriesController.create);
router.get('/', authenticateToken, queriesController.list);

module.exports = router;