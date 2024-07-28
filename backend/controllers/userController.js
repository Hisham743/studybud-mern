require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/userModel');
const Room = require('../models/roomModel');
const Message = require('../models/messageModel');
const Topic = require('../models/topicModel');
const { topicRegex } = require('../utils/regex');
const cloudinary = require('../utils/cloudinary');
const {
  userDetailsPipeline,
  queryRoomsPipeline,
  queryMessagesPipeline,
} = require('../utils/aggregationPipelines');

const getUsers = async (req, res) => {
  const users = await User.aggregate([
    { $sort: { createdAt: -1 } },
    ...userDetailsPipeline,
  ]);
  res.status(200).json(users);
};

const getUser = async (req, res) => {
  const user = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
    ...userDetailsPipeline,
  ])
    .then((results) => results[0])
    .then((doc) => User.populate(doc, 'rooms'));

  res.status(200).json(user);
};

const createUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const user = await User.createUser(name, username, email, password);
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ ...userWithoutPassword });
  } catch (error) {
    res.status(500).json({ msg: 'An unexpected error occurred' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateFieldNames = [
    'name',
    'username',
    'email',
    'password',
    'bio',
    'isDeleted',
  ];

  const updateFields = {};
  await Promise.all(
    updateFieldNames.map(async (fieldName) => {
      const value = req.body[fieldName];
      if (value !== undefined) {
        updateFields[fieldName] = value;

        if (fieldName === 'password') {
          const hashedPassword = await bcrypt.hash(
            value,
            await bcrypt.genSalt(10)
          );
          updateFields.password = hashedPassword;
        }
      }

      if (fieldName === 'isDeleted' && value) {
        const stringTime = Date.now().toString();
        // doing this so that the user can create a new account with same username and/or email if wanted
        updateFields.username = req.user.username.concat(stringTime);
        updateFields.email = stringTime.concat(req.user.email);
        updateFields.avatar = '';

        await cloudinary.uploader.destroy(`avatars/${req.user._id}`, {
          invalidate: true,
        });
      }
    })
  );

  try {
    if (req.file) {
      const response = await cloudinary.uploader.upload(req.file.path, {
        folder: 'avatars',
        public_id: req.user._id,
        allowed_formats: ['jpeg', 'jpg', 'png'],
        invalidate: true,
        transformation: [
          { crop: 'fill', gravity: 'auto', width: 500, height: 500 },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      updateFields.avatar = response.secure_url;
      fs.unlinkSync(path.resolve(req.file.path));
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    return req.body.isDeleted
      ? res.status(204).send()
      : res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ msg: 'An unexpected error occurred' });
  }
};

const getHostedRooms = async (req, res) => {
  const { query, topic: topicName } = req.query;
  const user = req.user;

  let topic;
  if (topicName) {
    topic = await Topic.findOne({ name: topicRegex(topicName) });
    if (!topic) {
      return res.status(200).json([]);
    }
  }

  let rooms;
  if (topicName) {
    rooms = topic
      ? await Room.aggregate([
          { $match: { host: user._id } },
          ...queryRoomsPipeline(query, topicName),
        ])
      : [];
  } else {
    rooms = await Room.aggregate([
      { $match: { host: user._id } },
      ...queryRoomsPipeline(query),
    ]);
  }

  res.status(200).json(rooms);
};

const getMessages = async (req, res) => {
  const { query, topicName } = req.query;
  const user = req.user;

  let topic;
  if (topicName) {
    topic = await Topic.findOne({ name: topicRegex(topicName) });
    if (!topic) {
      return res.status(200).json([]);
    }
  }

  let messages;
  if (topicName) {
    messages = topic
      ? await Message.aggregate([
          { $match: { host: user._id } },
          ...queryMessagesPipeline(query, topicName),
        ])
      : [];
  } else {
    messages = await Message.aggregate([
      { $match: { sender: user._id } },
      ...queryMessagesPipeline(query),
    ]);
  }

  res.status(200).json(messages);
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  getHostedRooms,
  getMessages,
};
