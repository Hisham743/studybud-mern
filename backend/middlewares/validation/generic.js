const { body } = require('express-validator');
const mongoose = require('mongoose');

const Room = require('../../models/roomModel');
const Message = require('../../models/messageModel');
const User = require('../../models/userModel');
const Topic = require('../../models/topicModel');

const MODELS = {
  room: Room,
  message: Message,
  user: User,
  topic: Topic,
};

const toSentenseCase = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const fetchDocument = (modelName) => async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ msg: `Invalid ${modelName} ID provided` });
  }

  const model = MODELS[modelName];
  const document = await model.findById(id);

  if (!document) {
    return res.status(404).json({ msg: `No such ${modelName} exists` });
  }

  req[modelName] = document;
  next();
};

const cantChangeOwner = (modelName, ownerField) => {
  return (owner, { req }) => {
    if (req[modelName][ownerField].toString() !== owner) {
      throw new Error(
        `${toSentenseCase(ownerField)} of a ${modelName} cannot be changed`
      );
    }
    return true;
  };
};

const requiredField = (fieldName, alias = fieldName) => {
  return body(fieldName)
    .exists()
    .withMessage(`${toSentenseCase(alias ? alias : fieldName)} is required`)
    .bail()

    .trim()
    .notEmpty()
    .withMessage(`${alias ? alias : fieldName} cannot be empty`);
};

const optionalNonEmptyField = (fieldName, alias = fieldName) => {
  return body(fieldName)
    .optional()
    .trim()
    .notEmpty()
    .withMessage(`${alias ? alias : fieldName} cannot be empty`);
};

module.exports = {
  fetchDocument,
  cantChangeOwner,
  requiredField,
  optionalNonEmptyField,
};
