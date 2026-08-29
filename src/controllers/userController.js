const User = require('../models/User');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const QueryFeatures = require('../utils/queryFeatures');
const sanitizeUpdate = require('../utils/sanitizeUpdate');

const getUsers = asyncHandler(async (req, res) => {
  const features = new QueryFeatures(User.find(), req.query)
    .filter(['name', 'email', 'role'])
    .sort('-createdAt')
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    pagination: features.pagination,
    results: users.length,
    data: { users }
  });
});

const getUserById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({ status: 'success', data: { user } });
});

const updateUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const allowedUpdates = sanitizeUpdate(req.body, ['name', 'email', 'role']);

  if (Object.keys(allowedUpdates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update');
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(204).send();
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };
