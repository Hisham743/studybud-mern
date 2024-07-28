'use strict';

const Topic = require('../../../models/topicModel');
const handleValidationErrors = require('../handleValidationErrors');
const { requiredField } = require('../generic');

const validateCreateTopic = [
  requiredField('name')
    .bail()
    .custom(async (name, { req }) => {
      const topic = await Topic.findOne({ name, _id: { $ne: req.params.id } });
      if (topic) {
        throw new Error('A topic with that name already exists');
      }
      return true; 
    }),

  handleValidationErrors,
];

module.exports = { validateCreateTopic };
