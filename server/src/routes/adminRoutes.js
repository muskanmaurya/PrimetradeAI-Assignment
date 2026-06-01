const express = require('express');
const { getAdminOverview } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Simple root to verify the admin router is mounted
router.get('/', (req, res) => {
	return res.status(200).json({ success: true, message: 'admin route mounted' });
});

// Apply protection to all admin routes below
router.use(protect);

// Overview - only admins
router.get('/overview', authorize('admin'), getAdminOverview);

module.exports = router;
