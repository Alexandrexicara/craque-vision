const Video = require('../models/video.model');
const Athlete = require('../models/athlete.model');
const Like = require('../models/like.model');
const Subscription = require('../models/subscription.model');

exports.uploadVideo = async (req, res) => {
  try {
    const userId = req.userId;
    const athlete = await Athlete.findByUserId(userId);

    if (!athlete) {
      return res.status(404).json({ error: 'Perfil de atleta não encontrado' });
    }

    const { video_url, thumbnail, title, type, description, payment_proof } = req.body;

    const video = await Video.create({
      athlete_id: athlete.id,
      video_url,
      thumbnail,
      title,
      type,
      description,
      payment_proof
    });

    res.status(201).json({
      message: 'Vídeo enviado com sucesso! Aguardando confirmação do pagamento pelo admin.',
      video
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyVideos = async (req, res) => {
  try {
    const userId = req.userId;
    const athlete = await Athlete.findByUserId(userId);

    if (!athlete) {
      return res.status(404).json({ error: 'Perfil de atleta não encontrado' });
    }

    const videos = await Video.findByAthleteIdAll(athlete.id);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAthleteVideos = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const user = req.user;

    // 24h se aplica a TODO olheiro (normal e Elite)
    // Clubes, atletas e admin veem imediatamente
    let apply24h = (user.user_type === 'scout');

    const videos = await Video.findByAthleteId(athleteId, apply24h);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    const likesCount = await Like.countByVideoId(id);

    res.json({
      ...video,
      likes_count: likesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeaturedVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const user = req.user;

    // 24h se aplica a TODO olheiro (normal e Elite)
    // Clubes, atletas e admin veem imediatamente
    let apply24h = user ? (user.user_type === 'scout') : false;

    const videos = await Video.getFeatured(limit, apply24h);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint público para a Home — retorna metadados para todos,
// mas só inclui video_url para usuários autenticados e com pagamento
exports.getPublicFeaturedVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const user = req.user || null;

    let apply24h = false;
    let canWatch = false;

    if (user) {
      // Admin, atleta com vídeo, scout/club com assinatura ativa
      if (user.user_type === 'admin') {
        canWatch = true;
      } else if (user.user_type === 'athlete') {
        const athlete = await Athlete.findByUserId(user.id);
        if (athlete) {
          const videos = await Video.findByAthleteIdAll(athlete.id);
          canWatch = videos.length > 0;
        }
      } else if (user.user_type === 'scout' || user.user_type === 'club') {
        canWatch = await Subscription.isActive(user.id);
        apply24h = (user.user_type === 'scout');
      }
    }

    const videos = await Video.getFeatured(limit, apply24h);

    // Remove video_url para quem não pode assistir
    const safeVideos = videos.map(v => {
      if (!canWatch) {
        const { video_url, ...rest } = v;
        return { ...rest, video_url: null, locked: true };
      }
      return { ...v, locked: false };
    });

    res.json({ videos: safeVideos, canWatch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const athlete = await Athlete.findByUserId(userId);

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    if (video.user_id !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await Video.delete(id);
    res.json({ message: 'Vídeo excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
