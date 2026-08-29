const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, token missing');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden'));
  }

  return next();
};

module.exports = { protect, restrictTo };
