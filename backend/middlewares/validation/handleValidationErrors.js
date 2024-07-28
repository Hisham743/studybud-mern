const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req).array();
  if (req.fileUploadError) errors.push(req.fileUploadError);

  if (errors.length > 0) {
    const notFoundError = errors.find((err) => err.status === 404);
    const unAuthorizedError = errors.find((err) => err.status === 401);
    const internalError = errors.find((err) => err.status === 500);

    if (notFoundError) {
      return res.status(404).json({ errors: [notFoundError] });
    } else if (unAuthorizedError) {
      return res.status(401).json({ errors: [unAuthorizedError] });
    } else if (internalError) {
      return res.status(500).json({ msg: 'An unexpected error occurred' });
    } else {
      return res.status(400).json({ errors: errors });
    }
  }

  next();
};

module.exports = handleValidationErrors;
