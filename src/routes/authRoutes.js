const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.use(authLimiter);
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', protect, getMe);

module.exports = router;
