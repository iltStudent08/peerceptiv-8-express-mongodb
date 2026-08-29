const { body } = require('express-validator');

const postValidator = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('content').isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string')
];

module.exports = { postValidator };
