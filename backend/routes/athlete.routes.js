const express = require('express');
const router = express.Router();
const athleteController = require('../controllers/athlete.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/profile', authenticate, authorize('athlete'), athleteController.createProfile);
router.get('/profile', authenticate, authorize('athlete'), athleteController.getProfile);
router.put('/profile', authenticate, authorize('athlete'), athleteController.updateProfile);
router.get('/search', athleteController.searchAthletes);
router.get('/all', athleteController.getAllAthletes);
router.get('/:id', athleteController.getAthleteById);

module.exports = router;
