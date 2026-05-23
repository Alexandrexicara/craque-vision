const pool = require('../config/database');

class Video {
  static async create(videoData) {
    const { athlete_id, video_url, thumbnail, title, type, description, payment_proof } = videoData;

    const query = `
      INSERT INTO videos (athlete_id, video_url, thumbnail, title, type, description, payment_proof)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [athlete_id, video_url, thumbnail, title, type, description, payment_proof];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // apply24h: true = aplica delay de 24h (apenas olheiros não-Elite)
  static async findByAthleteId(athleteId, apply24h = false) {
    const query = `
      SELECT * FROM videos 
      WHERE athlete_id = $1
      AND status = 'approved'
      ${apply24h ? "AND created_at <= NOW() - INTERVAL '24 hours'" : ''}
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [athleteId]);
    return result.rows;
  }

  // Retorna TODOS os vídeos do atleta (qualquer status) - para o próprio atleta
  static async findByAthleteIdAll(athleteId) {
    const query = `
      SELECT * FROM videos 
      WHERE athlete_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [athleteId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT v.*, a.user_id, u.name as athlete_name
      FROM videos v
      JOIN athletes a ON v.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE v.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // apply24h: true = aplica delay de 24h (apenas olheiros não-Elite)
  static async getFeatured(limit = 6, apply24h = false) {
    const query = `
      SELECT v.*, a.user_id, u.name as athlete_name, a.sport
      FROM videos v
      JOIN athletes a ON v.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE v.status = 'approved'
      ${apply24h ? "AND v.created_at <= NOW() - INTERVAL '24 hours'" : ''}
      ORDER BY v.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM videos WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Video;
