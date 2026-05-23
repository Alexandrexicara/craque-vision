const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const likeController = require('../controllers/like.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { requireSubscription } = require('../middleware/subscription.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize('athlete'), videoController.uploadVideo);
router.get('/my-videos', authenticate, authorize('athlete'), videoController.getMyVideos);
router.get('/featured', authenticate, requireSubscription, videoController.getFeaturedVideos);
router.get('/public/featured', optionalAuth, videoController.getPublicFeaturedVideos);
router.get('/athlete/:athleteId', authenticate, requireSubscription, videoController.getAthleteVideos);
router.get('/:id', authenticate, requireSubscription, videoController.getVideoById);
router.delete('/:id', authenticate, authorize('athlete'), videoController.deleteVideo);

router.post('/like', authenticate, likeController.likeVideo);
router.delete('/like/:videoId', authenticate, likeController.unlikeVideo);
router.get('/:videoId/likes', likeController.getVideoLikes);
router.get('/:videoId/like-status', authenticate, likeController.checkLike);

module.exports = router;
