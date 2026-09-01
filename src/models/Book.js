const mongoose = require('mongoose');

const GENRES = [
  'fiction',
  'non-fiction',
  'fantasy',
  'science-fiction',
  'mystery',
  'biography',
  'history',
  'poetry',
  'technology'
];

// Accepts ISBN-10 or ISBN-13 once separators are removed.
const isbnPattern = /^(?:\d{9}[\dXx]|\d{13})$/;

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title must be at most 200 characters']
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      set: (value) => (typeof value === 'string' ? value.replace(/[\s-]/g, '') : value),
      validate: {
        validator: (value) => isbnPattern.test(value),
        message: 'ISBN must be a valid 10 or 13 digit ISBN'
      }
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      lowercase: true,
      enum: {
        values: GENRES,
        message: `Genre must be one of: ${GENRES.join(', ')}`
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must be at most 2000 characters']
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: [1450, 'Published year must be 1450 or later'],
      validate: {
        validator(value) {
          return Number.isInteger(value) && value <= new Date().getFullYear() + 1;
        },
        message: 'Published year must be a whole number no more than one year in the future'
      }
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    copiesAvailable: {
      type: Number,
      default: 0,
      min: [0, 'Copies available cannot be negative']
    },
    tags: {
      type: [String],
      default: []
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Author is required']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'AddedBy is required']
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

bookSchema.index({ title: 1, author: 1 });

bookSchema.virtual('inStock').get(function inStock() {
  return this.copiesAvailable > 0;
});

const Book = mongoose.model('Book', bookSchema);
Book.GENRES = GENRES;

module.exports = Book;
