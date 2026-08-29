const express = require('express');
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { postValidator } = require('../validators/postValidators');
const validateRequest = require('../middleware/validateRequest');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.use(apiLimiter);
router.route('/').get(getPosts).post(protect, postValidator, validateRequest, createPost);
router.route('/:id').get(getPostById).patch(protect, postValidator, validateRequest, updatePost).delete(protect, deletePost);

module.exports = router;
