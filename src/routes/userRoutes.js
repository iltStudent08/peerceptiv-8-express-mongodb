const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.route('/').get(getUsers);
router.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
