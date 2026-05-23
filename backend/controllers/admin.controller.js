const pool = require('../config/database');
const User = require('../models/user.model');
const Athlete = require('../models/athlete.model');
const Video = require('../models/video.model');
const Subscription = require('../models/subscription.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM athletes'),
      pool.query('SELECT COUNT(*) FROM videos'),
      pool.query('SELECT COUNT(*) FROM subscriptions WHERE status = $1', ['active']),
      pool.query('SELECT COUNT(*) FROM users WHERE user_type = $1', ['athlete']),
      pool.query('SELECT COUNT(*) FROM users WHERE user_type = $1', ['scout']),
      pool.query('SELECT COUNT(*) FROM users WHERE user_type = $1', ['club'])
    ]);

    res.json({
      total_users: parseInt(stats[0].rows[0].count),
      total_athletes: parseInt(stats[1].rows[0].count),
      total_videos: parseInt(stats[2].rows[0].count),
      active_subscriptions: parseInt(stats[3].rows[0].count),
      athletes_count: parseInt(stats[4].rows[0].count),
      scouts_count: parseInt(stats[5].rows[0].count),
      clubs_count: parseInt(stats[6].rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, user_type, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const query = `
      SELECT v.*, u.name as athlete_name, a.sport
      FROM videos v
      JOIN athletes a ON v.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      ORDER BY v.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const query = `
      SELECT s.*, u.name as user_name, u.email
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE videos SET status = $1 WHERE id = $2 RETURNING *
    `;
    const result = await pool.query(query, ['approved', id]);
    res.json({
      message: 'Vídeo aprovado',
      video: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const query = `
      UPDATE videos SET status = $1, rejection_reason = $2 WHERE id = $3 RETURNING *
    `;
    const result = await pool.query(query, ['rejected', reason, id]);
    res.json({
      message: 'Vídeo rejeitado',
      video: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuário excluído' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
