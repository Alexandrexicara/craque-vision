const pool = require('../config/database');
const crypto = require('crypto');

const PLANS = {
  scout_basic: { name: 'Scout Basic', amount: 97, currency: 'BRL' },
  scout_pro: { name: 'Scout Pro', amount: 197, currency: 'BRL' },
  elite_club: { name: 'Elite Club', amount: 5000, currency: 'BRL' }
};
const appUrl = () => String(process.env.APP_URL || 'https://craque-vision.onrender.com').replace(/\/+$/, '');

async function sumup(path, options = {}) {
  const key = String(process.env.SUMUP_API_KEY || '').trim();
  if (!key || key.startsWith('sup_pk_')) {
    const error = new Error('Configure no Render uma chave secreta SumUp válida (SUMUP_API_KEY).');
    error.status = 503;
    throw error;
  }
  const response = await fetch('https://api.sumup.com' + path, {
    ...options,
    headers: { Authorization: 'Bearer ' + key, Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.message || 'Erro na SumUp (HTTP ' + response.status + ').');
    error.status = response.status;
    throw error;
  }
  return data;
}

async function getMerchantCode() {
  const configured = String(process.env.SUMUP_MERCHANT_CODE || '').trim();
  if (configured) return configured;
  const profile = await sumup('/v0.1/me');
  const code = profile.merchant_code || profile.merchantCode ||
    profile.merchant_profile?.merchant_code || profile.merchant_profile?.merchantCode;
  if (!code) {
    const error = new Error('A chave SumUp foi aceita, mas o código do estabelecimento não veio no perfil /v0.1/me. Configure SUMUP_MERCHANT_CODE no Render.');
    error.status = 503;
    throw error;
  }
  return String(code);
}

async function settleCheckout(checkout) {
  if (!checkout || !checkout.id) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query(
      'SELECT * FROM payments WHERE external_payment_id = $1 AND type = $2 FOR UPDATE',
      [String(checkout.id), 'subscription']
    );
    if (!found.rowCount) { await client.query('ROLLBACK'); return; }
    const payment = found.rows[0];

    if (checkout.status === 'FAILED' || checkout.status === 'EXPIRED') {
      await client.query("UPDATE payments SET status = 'failed', updated_at = NOW() WHERE id = $1 AND status = 'pending'", [payment.id]);
      await client.query("UPDATE subscriptions SET payment_status = 'failed', status = 'cancelled', updated_at = NOW() WHERE payment_id = $1 AND status = 'pending_payment'", [String(checkout.id)]);
      await client.query('COMMIT');
      return;
    }
    if (checkout.status !== 'PAID') { await client.query('COMMIT'); return; }

    const valid =
      Number(checkout.amount).toFixed(2) === Number(payment.amount).toFixed(2) &&
      checkout.currency === payment.currency &&
      checkout.checkout_reference === payment.external_reference &&
      checkout.merchant_code === payment.merchant_code;
    if (!valid) {
      await client.query("UPDATE payments SET status = 'failed', updated_at = NOW() WHERE id = $1 AND status = 'pending'", [payment.id]);
      await client.query("UPDATE subscriptions SET payment_status = 'review', updated_at = NOW() WHERE payment_id = $1 AND status = 'pending_payment'", [String(checkout.id)]);
      await client.query('COMMIT');
      return;
    }
    if (payment.status !== 'completed') {
      await client.query("UPDATE payments SET status = 'completed', updated_at = NOW() WHERE id = $1", [payment.id]);
      await client.query("UPDATE subscriptions SET status = 'active', payment_status = 'approved', expires_at = NOW() + INTERVAL '30 days', updated_at = NOW() WHERE payment_id = $1 AND status = 'pending_payment'", [String(checkout.id)]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

exports.createSumupCheckout = async (req, res) => {
  try {
    const planKey = String(req.body.plan_name || '');
    const plan = PLANS[planKey];
    if (!plan) return res.status(400).json({ error: 'Plano inválido.' });
    const merchantCode = await getMerchantCode();
    const reference = 'cv-' + crypto.randomUUID();
    const checkout = await sumup('/v0.1/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        checkout_reference: reference,
        amount: plan.amount,
        currency: plan.currency,
        merchant_code: merchantCode,
        description: 'Craque Vision - ' + plan.name,
        redirect_url: appUrl() + '/pagamento?sumup=return',
        hosted_checkout: { enabled: true }
      })
    });
    if (!checkout.id || !checkout.hosted_checkout_url) throw new Error('A SumUp não retornou o link do checkout hospedado.');

    const client = await pool.connect();
    let subscription;
    try {
      await client.query('BEGIN');
      subscription = await client.query(
        "INSERT INTO subscriptions (user_id, plan_name, status, expires_at, payment_id, payment_status) VALUES ($1, $2, 'pending_payment', NOW() + INTERVAL '30 days', $3, 'pending') RETURNING *",
        [req.userId, planKey, String(checkout.id)]
      );
      await client.query(
        "INSERT INTO payments (user_id, type, plan_name, amount, currency, status, payment_method, external_payment_id, external_reference, merchant_code) VALUES ($1, 'subscription', $2, $3, $4, 'pending', 'sumup', $5, $6, $7)",
        [req.userId, planKey, plan.amount, plan.currency, String(checkout.id), reference, merchantCode]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
    return res.status(201).json({
      checkout_url: checkout.hosted_checkout_url,
      checkout_id: String(checkout.id),
      subscription: subscription.rows[0],
      plan: { name: plan.name, amount: plan.amount, currency: plan.currency }
    });
  } catch (error) {
    console.error('SumUp checkout:', error.status || '', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Não foi possível iniciar o pagamento.' });
  }
};

exports.sumupWebhook = async (req, res) => {
  try {
    const checkoutId = String(req.body?.id || req.body?.checkout_id || '');
    if (!checkoutId) return res.sendStatus(204);
    const checkout = await sumup('/v0.1/checkouts/' + encodeURIComponent(checkoutId));
    await settleCheckout(checkout);
    return res.sendStatus(204);
  } catch (error) {
    console.error('SumUp webhook:', error.status || '', error.message);
    return res.status(500).json({ error: 'Falha ao confirmar pagamento SumUp.' });
  }
};

exports.sumupStatus = async (req, res) => {
  try {
    const pending = await pool.query(
      "SELECT payment_id FROM subscriptions WHERE user_id = $1 AND status = 'pending_payment' AND payment_id IS NOT NULL ORDER BY created_at DESC LIMIT 1",
      [req.userId]
    );
    if (pending.rowCount) {
      const checkout = await sumup('/v0.1/checkouts/' + encodeURIComponent(pending.rows[0].payment_id));
      await settleCheckout(checkout);
    }
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    );
    return res.json({ has_subscription: Boolean(result.rowCount), subscription: result.rows[0] || null });
  } catch (error) {
    console.error('SumUp status:', error.status || '', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Não foi possível consultar o pagamento.' });
  }
};
