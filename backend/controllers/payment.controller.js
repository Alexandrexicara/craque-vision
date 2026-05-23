const Subscription = require('../models/subscription.model');
const path = require('path');
const fs = require('fs');

const SUBSCRIPTION_PLANS = {
  'scout_basic': { name: 'Scout Basic', price: 97 },
  'scout_pro': { name: 'Scout Pro', price: 197 },
  'elite_club': { name: 'Elite Club', price: 5000 }
};

const PIX_KEY = 'santossilvac990@gmail.com';
const PIX_BANK = 'PagBank';

exports.getSubscriptionPlans = async (req, res) => {
  try {
    res.json(SUBSCRIPTION_PLANS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPixInfo = async (req, res) => {
  try {
    res.json({
      pix_key: PIX_KEY,
      bank: PIX_BANK,
      instructions: 'Após o pagamento, envie o comprovante. O admin aprovará manualmente em até 24h.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSubscriptionPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { plan_name } = req.body;

    if (!SUBSCRIPTION_PLANS[plan_name]) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    const plan = SUBSCRIPTION_PLANS[plan_name];

    // Cria assinatura como pendente (aguardando comprovante + aprovação admin)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const subscription = await Subscription.create({
      user_id: userId,
      plan_name,
      status: 'pending_payment',
      expires_at: expiresAt,
      payment_id: null,
      payment_status: 'pending'
    });

    res.json({
      message: 'Assinatura criada. Envie o comprovante para ativação.',
      subscription,
      plan,
      pix_key: PIX_KEY,
      pix_bank: PIX_BANK,
      total: plan.price,
      instructions: 'Faça o PIX para a chave acima. Depois envie o comprovante. O admin aprovará manualmente.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Scout/Club envia comprovante de pagamento da assinatura
exports.uploadSubscriptionProof = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscription_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Envie o comprovante de pagamento.' });
    }

    let subscription;
    if (subscription_id) {
      subscription = await Subscription.findById(subscription_id);
      if (!subscription || subscription.user_id !== userId) {
        return res.status(404).json({ error: 'Assinatura não encontrada.' });
      }
    } else {
      subscription = await Subscription.findByUserId(userId);
      if (!subscription) {
        return res.status(404).json({ error: 'Nenhuma assinatura encontrada. Crie uma assinatura primeiro.' });
      }
    }

    const proofUrl = `/uploads/payments/${req.file.filename}`;
    const updated = await Subscription.updatePayment(subscription.id, proofUrl);

    res.json({
      message: 'Comprovante enviado! Aguardando aprovação do administrador.',
      subscription: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin aprova assinatura
exports.approveSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.approve(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Assinatura não encontrada.' });
    }
    res.json({ message: 'Assinatura aprovada e ativada!', subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin rejeita assinatura
exports.rejectSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.reject(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Assinatura não encontrada.' });
    }
    res.json({ message: 'Assinatura rejeitada.', subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Usuário consulta status da própria assinatura
exports.getMySubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const subscription = await Subscription.findByUserId(userId);

    if (!subscription) {
      return res.json({ has_subscription: false, subscription: null });
    }

    const isActive = await Subscription.isActive(userId);
    const daysUntilExpiry = isActive
      ? Math.ceil((new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      has_subscription: true,
      subscription: {
        ...subscription,
        is_active: isActive,
        days_until_expiry: daysUntilExpiry,
        expiring_soon: isActive && daysUntilExpiry <= 5,
        plan_details: SUBSCRIPTION_PLANS[subscription.plan_name] || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: lista assinaturas pendentes de aprovação
exports.getPendingSubscriptions = async (req, res) => {
  try {
    const pending = await Subscription.getPending();
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { payment_id, type, plan_name, expires_at, user_id } = req.body;
    const targetUserId = user_id || req.userId;

    if (type === 'subscription') {
      const subscription = await Subscription.create({
        user_id: targetUserId,
        plan_name,
        status: 'pending_payment',
        expires_at: expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        payment_id,
        payment_status: 'pending'
      });

      return res.json({
        message: 'Assinatura criada. Envie o comprovante para ativação.',
        subscription
      });
    }

    res.json({
      message: 'Pagamento registrado',
      payment_id,
      type
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
