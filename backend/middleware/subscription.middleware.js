const Subscription = require('../models/subscription.model');
const Athlete = require('../models/athlete.model');
const Video = require('../models/video.model');

exports.requireSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    // Admin sempre tem acesso
    if (user.user_type === 'admin') return next();

    // Athletes: precisa ter ao menos 1 vídeo enviado (já pagou pelo upload)
    if (user.user_type === 'athlete') {
      const athlete = await Athlete.findByUserId(user.id);
      if (!athlete) {
        return res.status(403).json({
          error: 'Complete seu perfil de atleta para acessar vídeos.',
          code: 'NO_PROFILE'
        });
      }
      const videos = await Video.findByAthleteIdAll(athlete.id);
      if (videos.length === 0) {
        return res.status(403).json({
          error: 'Envie pelo menos 1 vídeo para acessar os vídeos da plataforma.',
          code: 'NO_VIDEOS'
        });
      }
      return next();
    }

    // Scouts e Clubes: precisam de assinatura ativa
    if (user.user_type === 'scout' || user.user_type === 'club') {
      const sub = await Subscription.findByUserId(user.id);
      
      if (!sub) {
        return res.status(403).json({
          error: 'Você precisa de uma assinatura ativa para acessar os vídeos.',
          code: 'NO_SUBSCRIPTION'
        });
      }

      // Verifica se está pendente de pagamento
      if (sub.status === 'pending_payment' || sub.payment_status === 'pending') {
        return res.status(403).json({
          error: 'Seu comprovante está pendente de aprovação pelo administrador.',
          code: 'PAYMENT_PENDING'
        });
      }

      // Verifica se está expirada
      if (sub.status === 'expired') {
        return res.status(403).json({
          error: 'Sua assinatura expirou. Renove para continuar acessando.',
          code: 'SUBSCRIPTION_EXPIRED'
        });
      }

      // Verifica se foi cancelada/rejeitada
      if (sub.status === 'cancelled') {
        return res.status(403).json({
          error: 'Sua assinatura foi cancelada. Entre em contato com o suporte.',
          code: 'SUBSCRIPTION_CANCELLED'
        });
      }

      const isActive = await Subscription.isActive(user.id);
      if (!isActive) {
        return res.status(403).json({
          error: 'Sua assinatura expirou ou não está ativa.',
          code: 'NO_SUBSCRIPTION'
        });
      }

      return next();
    }

    return res.status(403).json({ error: 'Acesso negado.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
