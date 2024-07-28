'use strict';

const express = require('express');

const { getTopics, createTopic } = require('../controllers/topicController');
const {
  validateCreateTopic,
} = require('../middlewares/validation/modelValidators/topicValidators');
const { requireAuth } = require('../middlewares/authentication');

const router = express.Router();

router.get('/', getTopics);
router.post('/', requireAuth, validateCreateTopic, createTopic);

module.exports = router; 
