const express = require('express');
const { createBook, getBooks, getBookById, updateBook, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { createBookValidator, updateBookValidator } = require('../validators/bookValidators');
const validateRequest = require('../middleware/validateRequest');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.use(apiLimiter);
router.route('/').get(getBooks).post(protect, createBookValidator, validateRequest, createBook);
router
  .route('/:id')
  .get(getBookById)
  .patch(protect, updateBookValidator, validateRequest, updateBook)
  .delete(protect, deleteBook);

module.exports = router;
