const Post = require('../models/Post');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const QueryFeatures = require('../utils/queryFeatures');
const sanitizeUpdate = require('../utils/sanitizeUpdate');

const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({ ...req.body, author: req.user._id });
  res.status(201).json({ status: 'success', data: { post } });
});

const getPosts = asyncHandler(async (req, res) => {
  const features = new QueryFeatures(Post.find().populate('author', 'name email role'), req.query)
    .filter(['title', 'author'])
    .sort('-createdAt')
    .paginate();

  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    pagination: features.pagination,
    results: posts.length,
    data: { posts }
  });
});

const getPostById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid post id');
  }

  const post = await Post.findById(req.params.id).populate('author', 'name email role');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  res.status(200).json({ status: 'success', data: { post } });
});

const updatePost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid post id');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only update your own posts');
  }

  const allowedUpdates = sanitizeUpdate(req.body, ['title', 'content', 'tags']);

  if (Object.keys(allowedUpdates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update');
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true
  }).populate('author', 'name email role');

  res.status(200).json({ status: 'success', data: { post: updatedPost } });
});

const deletePost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid post id');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own posts');
  }

  await post.deleteOne();
  res.status(204).send();
});

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
