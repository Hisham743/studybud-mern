'use strict';

const mongoose = require('mongoose');

const Room = require('./roomModel');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.pre('findOneAndDelete', async function () {
  const id = this.getQuery()._id;

  await Room.findByIdAndUpdate(message.room, {
    '$pull': { messages: id },
  });
});

module.exports = mongoose.model('Message', messageSchema);
