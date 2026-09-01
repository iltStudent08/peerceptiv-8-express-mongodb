const express = require('express');
const { createAuthor, getAuthors, getAuthorById, updateAuthor, deleteAuthor } = require('../controllers/authorController');
const { protect } = require('../middleware/authMiddleware');
const { authorValidator, updateAuthorValidator } = require('../validators/bookValidators');
const validateRequest = require('../middleware/validateRequest');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.use(apiLimiter);
router.route('/').get(getAuthors).post(protect, authorValidator, validateRequest, createAuthor);
router
  .route('/:id')
  .get(getAuthorById)
  .patch(protect, updateAuthorValidator, validateRequest, updateAuthor)
  .delete(protect, deleteAuthor);

module.exports = router;
