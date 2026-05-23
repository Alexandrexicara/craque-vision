const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/stats', authenticate, authorize('admin'), adminController.getDashboardStats);
router.get('/users', authenticate, authorize('admin'), adminController.getAllUsers);
router.get('/videos', authenticate, authorize('admin'), adminController.getAllVideos);
router.get('/subscriptions', authenticate, authorize('admin'), adminController.getAllSubscriptions);
router.put('/videos/:id/approve', authenticate, authorize('admin'), adminController.approveVideo);
router.put('/videos/:id/reject', authenticate, authorize('admin'), adminController.rejectVideo);
router.delete('/users/:id', authenticate, authorize('admin'), adminController.deleteUser);

module.exports = router;
