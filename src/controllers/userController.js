const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const QueryFeatures = require('../utils/queryFeatures');

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
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({ status: 'success', data: { user } });
});

const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(204).send();
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };
