'use strict';

const express = require('express');

const {
  getMessages,
  getMessage,
  updateMessage,
} = require('../controllers/messageController');
const {
  validateUpdateMessage,
} = require('../middlewares/validation/modelValidators/messageValidators');
const { requireAuth, verifyUser } = require('../middlewares/authentication');
const { fetchDocument } = require('../middlewares/validation/generic');

const router = express.Router();

router.use('/:id', fetchDocument('message'));

router.get('/', getMessages);

router.get('/:id', getMessage);
router.patch(
  '/:id',
  requireAuth,
  verifyUser(
    (req) => req.message.sender,
    "You cannot alter someone else's message"
  ),
  validateUpdateMessage,
  updateMessage
);

module.exports = router;
