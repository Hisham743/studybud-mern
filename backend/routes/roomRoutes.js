'use strict';

const express = require('express');

const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getMessages,
  createMessage,
  getParticipants,
} = require('../controllers/roomController');
const {
  validateCreateRoom,
  validateUpdateRoom,
  validateCreateMessage,
} = require('../middlewares/validation/modelValidators/roomValidators');
const { requireAuth, verifyUser } = require('../middlewares/authentication');
const { fetchDocument } = require('../middlewares/validation/generic');

const router = express.Router();

router.get('/', getRooms);
router.post('/', requireAuth, validateCreateRoom, createRoom);

router.use('/:id', fetchDocument('room'));

router.get('/:id', getRoom);
router.patch(
  '/:id',
  requireAuth,
  verifyUser(
    (req) => req.room.host,
    'You cannot alter a room hosted by someone else'
  ),
  validateUpdateRoom,
  updateRoom
);
router.delete(
  '/:id',
  requireAuth,
  verifyUser(
    (req) => req.room.host,
    'You cannot delete a room hosted by someone else'
  ),
  deleteRoom
);

router.get('/:id/messages', getMessages);
router.post('/:id/messages', requireAuth, validateCreateMessage, createMessage);
router.get('/:id/participants', getParticipants);

module.exports = router;
