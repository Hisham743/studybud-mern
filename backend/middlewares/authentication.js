'use strict';

require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ msg: 'You need to login first' });
  }

  const token = authorization.split(' ')[1];
  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(_id);
    if (user.isDeleted) {
      return res.status(401).json({ msg: 'This account has been deleted' });
    }

    req.currentUser = user._id;
  } catch (error) {
    return res.status(401).json({ msg: 'You need to login as a valid user first' });
  }

  next();
};

const verifyUser = (getUserId, msg) => (req, res, next) => {
  if (req.currentUser.toString() !== getUserId(req).toString()) {
    return res.status(403).json({ msg });
  }

  next();
};

module.exports = { requireAuth, verifyUser };
