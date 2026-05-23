const Like = require('../models/like.model');
const Subscription = require('../models/subscription.model');

exports.likeVideo = async (req, res) => {
  try {
    const userId = req.userId;
    const { video_id } = req.body;

    const hasActiveSubscription = await Subscription.isActive(userId);
    if (!hasActiveSubscription) {
      return res.status(403).json({ error: 'Assinatura necessária para curtir vídeos' });
    }

    const existing = await Like.findByUserAndVideo(userId, video_id);
    if (existing) {
      return res.status(400).json({ error: 'Vídeo já curtido' });
    }

    const like = await Like.create({ user_id: userId, video_id });
    const likesCount = await Like.countByVideoId(video_id);

    res.status(201).json({
      message: 'Vídeo curtido com sucesso',
      like,
      likes_count: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unlikeVideo = async (req, res) => {
  try {
    const userId = req.userId;
    const { videoId } = req.params;

    await Like.delete(userId, videoId);
    const likesCount = await Like.countByVideoId(videoId);

    res.json({
      message: 'Curtida removida',
      likes_count: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideoLikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const likes = await Like.findByVideoId(videoId);
    const count = await Like.countByVideoId(videoId);

    res.json({
      likes,
      count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkLike = async (req, res) => {
  try {
    const userId = req.userId;
    const { videoId } = req.params;

    const like = await Like.findByUserAndVideo(userId, videoId);
    res.json({ has_liked: !!like });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
