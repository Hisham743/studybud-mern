const mongoose = require('mongoose');

const Room = require('../models/roomModel');
const Topic = require('../models/topicModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const { topicRegex } = require('../utils/regex');
const {
  roomDetailsPipeline,
  messageDetailsPipeline,
  userDetailsPipeline,
  queryRoomsPipeline,
} = require('../utils/aggregationPipelines');

const getRooms = async (req, res) => {
  const { query, topic: topicName } = req.query;

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
      ? await Room.aggregate(queryRoomsPipeline(query, topicName))
      : [];
  } else {
    rooms = await Room.aggregate(queryRoomsPipeline(query));
  }

  res.status(200).json(rooms);
};

const getRoom = async (req, res) => {
  const [room] = await Room.aggregate([
    { $match: { _id: req.room._id } },
    ...roomDetailsPipeline,
  ]);

  res.status(200).json(room);
};

const createRoom = async (req, res) => {
  const { name, description, topic: topicName } = req.body;
  const host = req.currentUser;
  const participants = [host];

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      let topic = await Topic.findOne({ name: topicName }).session(session);
      if (!topic) {
        [topic] = await Topic.create([{ name: topicName }], { session });
      }

      const createFields = { name, host, participants, topic: topic._id };
      if (description !== undefined) {
        createFields.description = description;
      }

      const [createdRoom] = await Room.create([createFields], {
        session,
        runValidators: true,
      });

      await User.findByIdAndUpdate(
        host,
        { $push: { rooms: createdRoom._id } },
        { session }
      );

      const [populatedRoom] = await Room.aggregate([
        { $match: { _id: createdRoom._id } },
        ...roomDetailsPipeline,
      ]).session(session);

      res.status(201).json(populatedRoom);
    });
  } catch (error) {
    res.status(500).json({ msg: 'An unexpected error occurred' });
  } finally {
    await session.endSession();
  }
};

const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, description, topic: topicName, participants } = req.body;
  const updateFields = {};

  if (name !== undefined) {
    updateFields.name = name;
  }
  if (description !== undefined) {
    updateFields.description = description;
  }
  if (participants !== undefined) {
    updateFields.participants = participants;
  }
  if (topicName !== undefined) {
    let topic = await Topic.findOne({ name: topicName });
    if (!topic) {
      topic = await Topic.create({ name: topicName });
    }
    updateFields.topic = topic._id;
  }

  try {
    const updatedRoom = await Room.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json(
        await Room.aggregate([
          { $match: { '_id': updatedRoom._id } },
          ...roomDetailsPipeline,
        ])
      );
  } catch (error) {
    res.status(500).json({ msg: 'An unexpected error occurred' });
  }
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await Message.deleteMany({ room: id }, { session });
      const room = await Room.findByIdAndDelete(id, { session });
      await User.findByIdAndUpdate(
        room.host,
        { $pull: { rooms: id } },
        { session }
      );

      res.status(204).send();
    });
  } catch (error) {
    console.error('Error during room deletion: ', error);
    res.status(500).json({ msg: 'An unexpected error occurred' });
  } finally {
    await session.endSession();
  }
};

const getMessages = async (req, res) => {
  const room = req.room;

  const messages = await Message.aggregate([
    { $match: { 'room': room._id } },
    ...messageDetailsPipeline,
    { $sort: { createdAt: -1 } },
  ]);

  res.status(200).json(messages);
};

const createMessage = async (req, res) => {
  const { body } = req.body;
  const room = req.room;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const [createdMessage] = await Message.create(
        [{ sender: req.currentUser, room: room._id, body }],
        { session, runValidators: true }
      );

      await Room.findByIdAndUpdate(
        room._id,
        { $addToSet: { participants: createdMessage.sender } },
        { session }
      );

      const [populatedMessage] = await Message.aggregate([
        { $match: { _id: createdMessage._id } },
        ...messageDetailsPipeline,
      ]).session(session);

      res.status(201).json(populatedMessage);
    });
  } catch (error) {
    res.status(500).json({ msg: 'An unexpected error occurred' });
  } finally {
    await session.endSession();
  }
};

const getParticipants = async (req, res) => {
  const users = await User.aggregate([
    { $sort: { createdAt: -1 } },
    ...userDetailsPipeline,
  ]);
  res.status(200).json(users);
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getMessages,
  createMessage,
  getParticipants,
};
