'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { cookie } = require('express-validator');

const User = require('../../models/userModel');
const handleValidationErrors = require('./handleValidationErrors');
const { requiredField } = require('./generic');

const validateLogin = [
  requiredField('email', 'email address')
    .bail()
    .isEmail()
    .withMessage('Invalid email address provided')
    .bail()

    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error(`User with that email address does not exist`);
        error.status = 404;
        throw error;
      }

      req.user = user;
      return true;
    }),

  requiredField('password'),
  handleValidationErrors,
];

const validateRefresh = [
  cookie('refreshToken')
    .exists()
    .withMessage('Refresh token is required')
    .bail()

    .notEmpty()
    .withMessage('Refresh token cannot be empty')
    .bail()

    .custom(async (refreshToken, { req }) => {
      try {
        const error = new Error();
        error.status = 401;

        const { _id } = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (!mongoose.isValidObjectId(_id)) {
          error.message = 'User with that ID does not exist';
          throw error;
        }

        const user = await User.findById(_id);
        if (!user) {
          error.message = 'User with that ID does not exist';
          throw error;
        } else if (user.isDeleted) {
          error.message = 'This account has been deleted';
          throw error;
        }

        req._id = _id;
      } catch (e) {
        const error = new Error();
        error.status = 401;

        if (e instanceof jwt.TokenExpiredError) {
          error.message = 'Refresh token expired';
        } else if (e instanceof jwt.JsonWebTokenError) {
          error.message = 'Invalid refresh token';
        } else if (e.status === 401) {
          throw e;
        } else {
          error.status = 500;
          error.message = 'An unexpected error occurred';
        }

        throw error;
      }
    }),

  handleValidationErrors,
];

module.exports = { validateLogin, validateRefresh };
