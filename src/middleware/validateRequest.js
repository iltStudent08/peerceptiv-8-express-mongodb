const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

module.exports = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError(400, errors.array().map((error) => error.msg).join(', ')));
  }

  return next();
};
