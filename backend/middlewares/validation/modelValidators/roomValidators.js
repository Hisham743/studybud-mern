const { param, body } = require('express-validator');
const mongoose = require('mongoose');

const Room = require('../../../models/roomModel');
const User = require('../../../models/userModel');
const handleValidationErrors = require('../handleValidationErrors');
const {
  cantChangeOwner,
  requiredField,
  optionalNonEmptyField,
} = require('../generic');

const checkRoomNameAlreadyExists = async (name, { req }) => {
  const query = { name };
  if (req.params.id) {
    query._id = { $ne: req.params.id };
  }

  const room = await Room.findOne(query);
  if (room) {
    throw new Error('A room with that name already exists');
  }
  return true;
};

const validateCreateRoom = [
  requiredField('name').bail().custom(checkRoomNameAlreadyExists),

  requiredField('topic'),
  handleValidationErrors,
];

const validateUpdateRoom = [
  body('host')
    .optional()
    .isMongoId()
    .withMessage('Invalid host ID provided')
    .bail()

    .custom(cantChangeOwner('room', 'host')),

  optionalNonEmptyField('name').bail().custom(checkRoomNameAlreadyExists),

  optionalNonEmptyField('topic'),

  body('participants')
    .optional()
    .isArray()
    .withMessage('Participants must be an array')
    .bail()

    .custom((participants) => {
      const areValidIds = participants.every((participant) =>
        mongoose.Types.ObjectId.isValid(participant)
      );

      if (!areValidIds) {
        throw new Error(
          'Invalid user ID provided for one or more participants'
        );
      }
    })
    .bail()

    .custom(async (participants) => {
      const validParticipants = await User.find({ _id: { $in: participants } });
      if (validParticipants.length !== participants.length) {
        throw new Error('One or more participants are not valid users');
      }
    })
    .bail()

    .custom(async (participants, { req }) => {
      if (!participants.includes(req.room.host.toString())) {
        throw new Error('Host cannot be removed from participants');
      }
    }),

  handleValidationErrors,
];

const validateCreateMessage = [
  requiredField('body', 'Message body'),
  handleValidationErrors,
];

module.exports = {
  validateCreateRoom,
  validateUpdateRoom,
  validateCreateMessage,
};
