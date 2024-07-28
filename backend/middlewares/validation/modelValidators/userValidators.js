'use strict';

const { body } = require('express-validator');

const User = require('../../../models/userModel');
const handleValidationErrors = require('../handleValidationErrors');
const { optionalNonEmptyField, requiredField } = require('../generic');

const checkUserAlreadyExists =
  (fieldName) =>
  async (value, { req }) => {
    const query = { [fieldName]: value };
    if (req.params.id) {
      query._id = { $ne: req.params.id };
    }

    const user = await User.findOne(query);
    if (user) {
      throw new Error(`A user with that ${fieldName} already exists`);
    }
    return true;
  };

const validateCreateUser = [
  requiredField('name'),
  requiredField('username').bail().custom(checkUserAlreadyExists('username')),

  requiredField('email', 'email address')
    .bail()
    .isEmail()
    .withMessage('Invalid email address provided')
    .bail()
    .custom(checkUserAlreadyExists('email')),

  requiredField('password')
    .bail()
    .isStrongPassword()
    .withMessage('Password is not strong enough'),

  handleValidationErrors,
];

const validateUpdateUser = [
  optionalNonEmptyField('name'),

  optionalNonEmptyField('username')
    .bail()
    .custom(checkUserAlreadyExists('username')),

  optionalNonEmptyField('email')
    .bail()
    .isEmail()
    .withMessage('Invalid email address provided')
    .bail()
    .custom(checkUserAlreadyExists('email')),

  optionalNonEmptyField('password')
    .bail()
    .isStrongPassword()
    .withMessage('Password is not strong enough'),

  body('rooms')
    .optional()
    .custom((rooms, { req }) => {
      if (rooms !== req.user.rooms) {
        throw new Error(
          'The rooms field is managed automatically and cannot be directly modified.'
        );
      }
      return true;
    }),

  body('isDeleted')
    .optional()
    .isBoolean()
    .withMessage('isDeleted must be a boolean value')
    .bail()

    .custom(async (isDeleted, { req }) => {
      if (!isDeleted && req.user.isDeleted) {
        throw new Error('Cannot undo delete');
      }

      return true;
    }),

  handleValidationErrors,
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
