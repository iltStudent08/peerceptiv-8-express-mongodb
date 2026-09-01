const mongoose = require('mongoose');
const Author = require('../models/Author');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const QueryFeatures = require('../utils/queryFeatures');
const sanitizeUpdate = require('../utils/sanitizeUpdate');

const ensureValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid author id');
  }
};

const createAuthor = asyncHandler(async (req, res) => {
  const author = await Author.create(req.body);
  res.status(201).json({ status: 'success', data: { author } });
});

const getAuthors = asyncHandler(async (req, res) => {
  const features = new QueryFeatures(Author.find(), req.query)
    .filter(['name', 'nationality', 'birthYear'])
    .sort('name')
    .paginate();

  const authors = await features.query;

  res.status(200).json({
    status: 'success',
    pagination: features.pagination,
    results: authors.length,
    data: { authors }
  });
});

const getAuthorById = asyncHandler(async (req, res) => {
  ensureValidId(req.params.id);

  const author = await Author.findById(req.params.id).populate('books', 'title genre publishedYear price');

  if (!author) {
    throw new ApiError(404, 'Author not found');
  }

  res.status(200).json({ status: 'success', data: { author } });
});

const updateAuthor = asyncHandler(async (req, res) => {
  ensureValidId(req.params.id);

  const allowedUpdates = sanitizeUpdate(req.body, ['name', 'bio', 'nationality', 'birthYear']);

  if (Object.keys(allowedUpdates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update');
  }

  const author = await Author.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true
  });

  if (!author) {
    throw new ApiError(404, 'Author not found');
  }

  res.status(200).json({ status: 'success', data: { author } });
});

const deleteAuthor = asyncHandler(async (req, res) => {
  ensureValidId(req.params.id);

  const author = await Author.findById(req.params.id);

  if (!author) {
    throw new ApiError(404, 'Author not found');
  }

  const bookCount = await Book.countDocuments({ author: author._id });

  if (bookCount > 0) {
    throw new ApiError(409, 'Author still has books in the catalog');
  }

  await author.deleteOne();
  res.status(204).send();
});

module.exports = { createAuthor, getAuthors, getAuthorById, updateAuthor, deleteAuthor };
