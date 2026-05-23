const Athlete = require('../models/athlete.model');
const Favorite = require('../models/favorite.model');
const Video = require('../models/video.model');
const Subscription = require('../models/subscription.model');

exports.searchAthletes = async (req, res) => {
  try {
    const userId = req.userId;
    const hasActiveSubscription = await Subscription.isActive(userId);

    if (!hasActiveSubscription) {
      return res.status(403).json({ error: 'Assinatura necessária para acessar esta funcionalidade' });
    }

    const filters = req.query;
    const athletes = await Athlete.search(filters);
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAthleteDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const hasActiveSubscription = await Subscription.isActive(userId);

    if (!hasActiveSubscription) {
      return res.status(403).json({ error: 'Assinatura necessária para acessar esta funcionalidade' });
    }

    const { id } = req.params;
    const athlete = await Athlete.findById(id);

    if (!athlete) {
      return res.status(404).json({ error: 'Atleta não encontrado' });
    }

    const videos = await Video.findByAthleteId(id);

    res.json({
      ...athlete,
      videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { athlete_id } = req.body;

    const hasActiveSubscription = await Subscription.isActive(userId);
    if (!hasActiveSubscription) {
      return res.status(403).json({ error: 'Assinatura necessária para favoritar atletas' });
    }

    const existing = await Favorite.findByUserAndAthlete(userId, athlete_id);
    if (existing) {
      return res.status(400).json({ error: 'Atleta já está nos favoritos' });
    }

    const favorite = await Favorite.create({ user_id: userId, athlete_id });
    res.status(201).json({
      message: 'Atleta adicionado aos favoritos',
      favorite
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.userId;
    const favorites = await Favorite.findByUserId(userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { athleteId } = req.params;

    await Favorite.delete(userId, athleteId);
    res.json({ message: 'Atleta removido dos favoritos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
