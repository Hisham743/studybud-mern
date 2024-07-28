const { body } = require('express-validator');

const handleValidationErrors = require('../handleValidationErrors');
const { cantChangeOwner, optionalNonEmptyField } = require('../generic');

const validateUpdateMessage = [
  optionalNonEmptyField('sender')
    .bail()
    .isMongoId()
    .withMessage('Invalid sender ID provided')
    .bail()

    .custom(cantChangeOwner('message', 'sender')),

  optionalNonEmptyField('body')
    .bail()
    .custom(async (body, { req }) => {
      const createdAt = req.message.createdAt;
      const timeElapsed = Date.now() - createdAt;

      if (timeElapsed > 5 * 60 * 1000) {
        throw new Error('Cannot edit messages after 5 minutes of sending');
      }

      return true;
    }),

  body('isDeleted')
    .optional()
    .isBoolean()
    .withMessage('isDeleted must be a boolean value')
    .bail()

    .custom(async (isDeleted, { req }) => {
      if (req.message.isDeleted) {
        throw new Error(
          isDeleted ? 'Message was already deleted' : 'Cannot undo delete'
        );
      }

      return true;
    }),

  handleValidationErrors,
];

module.exports = {
  validateUpdateMessage,
};
