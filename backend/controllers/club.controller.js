const Subscription = require('../models/subscription.model');
const Athlete = require('../models/athlete.model');
const User = require('../models/user.model');

const PLANS = {
  'scout_basic': { name: 'Scout Basic', price: 49 },
  'scout_pro': { name: 'Scout Pro', price: 99 },
  'elite_club': { name: 'Elite Club', price: 299 }
};

exports.getPlans = async (req, res) => {
  try {
    res.json(PLANS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const userId = req.userId;
    const { plan_name, expires_at, payment_id } = req.body;

    if (!PLANS[plan_name]) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    const subscription = await Subscription.create({
      user_id: userId,
      plan_name,
      status: 'active',
      expires_at,
      payment_id
    });

    res.status(201).json({
      message: 'Assinatura criada com sucesso',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const subscription = await Subscription.findByUserId(userId);

    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura encontrada' });
    }

    const isActive = await Subscription.isActive(userId);

    res.json({
      ...subscription,
      is_active: isActive,
      plan_details: PLANS[subscription.plan_name]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const userId = req.userId;
    const hasAccess = await Subscription.isActive(userId);
    res.json({ has_access: hasAccess });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClubDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const hasAccess = await Subscription.isActive(userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Assinatura necessária' });
    }

    const recentAthletes = await Athlete.search({});
    const featuredVideos = await require('../models/video.model').getFeatured(4, false); // club sempre imediato

    res.json({
      recent_athletes: recentAthletes.slice(0, 6),
      featured_videos: featuredVideos,
      stats: {
        total_athletes: recentAthletes.length,
        total_videos: featuredVideos.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
