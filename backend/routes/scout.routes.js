const express = require('express');
const router = express.Router();
const scoutController = require('../controllers/scout.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/search', authenticate, authorize('scout', 'club'), scoutController.searchAthletes);
router.get('/athlete/:id', authenticate, authorize('scout', 'club'), scoutController.getAthleteDetails);
router.post('/favorites', authenticate, authorize('scout', 'club'), scoutController.addFavorite);
router.get('/favorites', authenticate, authorize('scout', 'club'), scoutController.getFavorites);
router.delete('/favorites/:athleteId', authenticate, authorize('scout', 'club'), scoutController.removeFavorite);

module.exports = router;
