'use strict';

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createAccessToken = (_id) => {
  return jwt.sign({ _id, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
};

const login = async (req, res) => {
  const { password } = req.body;

  const user = req.user;
  const match = await bcrypt.compare(password, user.password);

  try {
    if (!match) {
      return res.status(400).json({
        errors: [
          {
            value: password,
            msg: 'Incorrect password',
            param: 'password',
            location: 'body',
          },
        ],
      });
    }

    const accessToken = createAccessToken(user._id);

    const refreshToken = jwt.sign(
      { _id: user._id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ msg: 'An unexpected error occurred' });
  }
};

const refresh = (req, res) => {
  const _id = req._id;
  const accessToken = createAccessToken(_id);
  res.status(200).json({ accessToken });
};

const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(204).send();
};

module.exports = { login, refresh, logout };
