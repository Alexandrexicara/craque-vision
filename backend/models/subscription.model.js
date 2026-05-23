const pool = require('../config/database');

class Subscription {
  static async create(subscriptionData) {
    const { user_id, plan_name, status, expires_at, payment_id, payment_proof, payment_status } = subscriptionData;

    const query = `
      INSERT INTO subscriptions (user_id, plan_name, status, expires_at, payment_id, payment_proof, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [user_id, plan_name, status, expires_at, payment_id, payment_proof || null, payment_status || 'pending'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM subscriptions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT s.*, u.name as user_name, u.email, u.user_type
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async isActive(userId) {
    const query = `
      SELECT * FROM subscriptions 
      WHERE user_id = $1 
      AND status = 'active' 
      AND expires_at > NOW()
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0;
  }

  static async isElite(userId) {
    const query = `
      SELECT * FROM subscriptions 
      WHERE user_id = $1 
      AND status = 'active' 
      AND plan_name = 'Elite Club'
      AND expires_at > NOW()
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE subscriptions 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async updatePayment(id, payment_proof) {
    const query = `
      UPDATE subscriptions 
      SET payment_proof = $1, payment_status = 'pending', updated_at = NOW()
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [payment_proof, id]);
    return result.rows[0];
  }

  static async approve(id) {
    const query = `
      UPDATE subscriptions 
      SET payment_status = 'approved', status = 'active', updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async reject(id) {
    const query = `
      UPDATE subscriptions 
      SET payment_status = 'rejected', status = 'cancelled', updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Busca assinaturas que vencem em até X dias e ainda estão ativas
  static async getExpiringSoon(days = 5) {
    const query = `
      SELECT s.*, u.name as user_name, u.email
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
      AND s.expires_at > NOW()
      AND s.expires_at <= NOW() + INTERVAL '1 day' * $1
      ORDER BY s.expires_at ASC
    `;
    const result = await pool.query(query, [days]);
    return result.rows;
  }

  // Bloqueia automaticamente assinaturas expiradas
  static async blockExpired() {
    const query = `
      UPDATE subscriptions 
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'active' 
      AND expires_at <= NOW()
      RETURNING *
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Pega todas pendentes (para admin revisar)
  static async getPending() {
    const query = `
      SELECT s.*, u.name as user_name, u.email, u.user_type
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.payment_status = 'pending'
      AND s.payment_proof IS NOT NULL
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Subscription;
