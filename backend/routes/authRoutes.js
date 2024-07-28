'use strict';

const express = require('express');

const { login, refresh, logout } = require('../controllers/authController');
const {
  validateLogin,
  validateRefresh,
} = require('../middlewares/validation/authValidators');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/refresh', validateRefresh, refresh);
router.post('/logout', logout);

module.exports = router;
