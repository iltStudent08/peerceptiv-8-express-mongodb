const { body } = require('express-validator');
const Book = require('../models/Book');

const currentYear = new Date().getFullYear();

// express-validator chains are stateful, so each rule set is rebuilt per route.
const withOptional = (chain, optional) => (optional ? chain.optional() : chain);

const bookRules = (optional = false) => [
  withOptional(body('title'), optional)
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  withOptional(body('isbn'), optional)
    .customSanitizer((value) => (typeof value === 'string' ? value.replace(/[\s-]/g, '') : value))
    .matches(/^(?:\d{9}[\dXx]|\d{13})$/)
    .withMessage('ISBN must be a valid 10 or 13 digit ISBN'),
  withOptional(body('genre'), optional)
    .isIn(Book.GENRES)
    .withMessage(`Genre must be one of: ${Book.GENRES.join(', ')}`),
  withOptional(body('author'), optional).isMongoId().withMessage('Author must be a valid id'),
  withOptional(body('publishedYear'), optional)
    .isInt({ min: 1450, max: currentYear + 1 })
    .withMessage(`Published year must be between 1450 and ${currentYear + 1}`),
  withOptional(body('price'), optional).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('copiesAvailable').optional().isInt({ min: 0 }).withMessage('Copies available must be a non-negative integer'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string')
];

const authorRules = (optional = false) => [
  withOptional(body('name'), optional)
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Author name must be between 2 and 120 characters'),
  body('bio').optional().trim().isLength({ max: 2000 }).withMessage('Bio must be at most 2000 characters'),
  body('nationality').optional().trim().isLength({ max: 60 }).withMessage('Nationality must be at most 60 characters'),
  body('birthYear')
    .optional()
    .isInt({ min: 1000, max: currentYear })
    .withMessage(`Birth year must be between 1000 and ${currentYear}`)
];

module.exports = {
  createBookValidator: bookRules(false),
  updateBookValidator: bookRules(true),
  authorValidator: authorRules(false),
  updateAuthorValidator: authorRules(true)
};
