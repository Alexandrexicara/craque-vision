const express = require('express');
const router = express.Router();
const clubController = require('../controllers/club.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/plans', clubController.getPlans);
router.post('/subscribe', authenticate, authorize('club', 'scout'), clubController.subscribe);
router.get('/subscription', authenticate, clubController.getMySubscription);
router.get('/check-access', authenticate, clubController.checkAccess);
router.get('/dashboard', authenticate, authorize('club', 'scout'), clubController.getClubDashboard);

module.exports = router;
