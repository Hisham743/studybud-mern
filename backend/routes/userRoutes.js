'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');

const {
  getUser,
  getUsers,
  createUser,
  updateUser,
  getHostedRooms,
  getMessages,
} = require('../controllers/userController');
const {
  validateCreateUser,
  validateUpdateUser,
} = require('../middlewares/validation/modelValidators/userValidators');
const { requireAuth, verifyUser } = require('../middlewares/authentication');
const { fetchDocument } = require('../middlewares/validation/generic');

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'temp',
  filename: (req, file, cb) =>
    cb(null, `avatar-${req.user._id}${path.extname(file.originalname)}`),
});

const validateAndSaveAvatar = (req, res, next) => {
  const saveAvatar = multer({
    storage,
    limits: {
      fileSize: 5242880, // 5 MB
    },
    fileFilter: (req, file, cb) => {
      const fileTypes = /jpeg|jpg|png/;
      const extName = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimeType = fileTypes.test(file.mimetype);

      return extName && mimeType
        ? cb(null, true)
        : cb(new Error('Only png and jpeg images are supported'), false);
    },
  }).single('avatar');

  const handleSaveError = (err) => {
    if (err) {
      req.fileUploadError = { type: 'field', location: 'body', path: 'avatar' };
      req.fileUploadError.msg =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'Image file should be off less than 5 MB'
          : err.message;
    }

    next();
  };

  saveAvatar(req, res, handleSaveError);
};

router.get('/', getUsers);
router.post('/', validateCreateUser, createUser);

router.use('/:id', fetchDocument('user'));

router.get('/:id', getUser);
router.patch(
  '/:id',
  validateAndSaveAvatar,
  requireAuth,
  verifyUser((req) => req.params.id, 'You cannot alter other user accounts'),
  (req, res, next) =>
    req.user.isDeleted
      ? res.status(410).json({
          msg: 'This account has been deleted and cannot be modified further.',
        })
      : next(),
  validateUpdateUser,
  updateUser
);

router.get('/:id/rooms', getHostedRooms);
router.get('/:id/messages', getMessages);

module.exports = router;
