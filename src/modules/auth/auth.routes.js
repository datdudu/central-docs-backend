const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authenticateToken = require('../../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);

module.exports = router;