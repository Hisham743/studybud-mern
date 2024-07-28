'use strict';

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return validator.isEmail(v);
        },
        msg: 'Invalid email address',
      },
    },
    password: {
      type: String,
      required: true,
    },
    bio: String,
    avatar: String,
    rooms: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
        },
      ],

      default: [],
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.statics.createUser = async function (
  name,
  username,
  email,
  password
) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await this.create({
    name,
    username,
    email,
    password: hashedPassword,
  });

  return user;
};

module.exports = mongoose.model('User', userSchema);
