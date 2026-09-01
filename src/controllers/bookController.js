const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const QueryFeatures = require('../utils/queryFeatures');
const sanitizeUpdate = require('../utils/sanitizeUpdate');

const ensureValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid book id');
  }
};

const ensureAuthorExists = async (authorId) => {
  if (!mongoose.isValidObjectId(authorId)) {
    throw new ApiError(400, 'Invalid author id');
  }

  const author = await Author.findById(authorId);

  if (!author) {
    throw new ApiError(404, 'Author not found');
  }
};

const createBook = asyncHandler(async (req, res) => {
  await ensureAuthorExists(req.body.author);

  const book = await Book.create({ ...req.body, addedBy: req.user._id });
  const populated = await book.populate([
    { path: 'author', select: 'name nationality' },
    { path: 'addedBy', select: 'name email' }
  ]);

  res.status(201).json({ status: 'success', data: { book: populated } });
});

const getBooks = asyncHandler(async (req, res) => {
  const baseQuery = Book.find()
    .populate('author', 'name nationality birthYear')
    .populate('addedBy', 'name email');

  const features = new QueryFeatures(baseQuery, req.query)
    .filter(['genre', 'author', 'publishedYear', 'tags'])
    .sort('-createdAt')
    .paginate();

  const books = await features.query;

  res.status(200).json({
    status: 'success',
    pagination: features.pagination,
    results: books.length,
    data: { books }
  });
});

const getBookById = asyncHandler(async (req, res) => {
  ensureValidId(req.params.id);

  const book = await Book.findById(req.params.id)
    .populate('author', 'name nationality birthYear bio')
    .populate('addedBy', 'name email');

  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  res.status(200).json({ status: 'success', data: { book } });
});

const updateBook = asyncHandler(async (req, res) => {
  ensureValidId(req.params.id);

  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  if (book.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only update books you added');
  }

  const allowedUpdates = sanitizeUpdate(req.body, [
    'title',
    'isbn',
    'genre',
    'description',
    'publishedYear',
    'price',
    'copiesAvailable',
    'tags',
    'author'
  ]);

  if (Object.keys(allowedUpdates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update');
  }

  if (allowedUpdates.author) {
    await ensureAuthorExists(allowedUpdates.author);
  }

  const updatedBook = await Book.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true
  })
    .populate('author', 'name nationality')
    .populate('addedBy', 'name email');

  res.status(200).json({ status: 'success', data: { book: updatedBook } });
});

const deleteBook = asyncHandler(async (req, res) => {
  ensureValidId(req.params.id);

  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  if (book.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete books you added');
  }

  await book.deleteOne();
  res.status(204).send();
});

module.exports = { createBook, getBooks, getBookById, updateBook, deleteBook };
