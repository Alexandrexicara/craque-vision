const pool = require('../config/database');

class VideoCredit {
  // Busca créditos do usuário
  static async getByUserId(userId) {
    const query = 'SELECT * FROM video_credits WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Adiciona créditos (quando admin confirma pagamento)
  static async addCredits(userId, quantity) {
    const existing = await this.getByUserId(userId);
    if (existing) {
      const query = `
        UPDATE video_credits 
        SET total_videos = total_videos + $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [quantity, userId]);
      return result.rows[0];
    } else {
      const query = `
        INSERT INTO video_credits (user_id, total_videos, used_videos)
        VALUES ($1, $2, 0)
        RETURNING *
      `;
      const result = await pool.query(query, [userId, quantity]);
      return result.rows[0];
    }
  }

  // Usa 1 crédito (após upload)
  static async useCredit(userId) {
    const query = `
      UPDATE video_credits 
      SET used_videos = used_videos + 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND (total_videos - used_videos) > 0
      RETURNING *
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Verifica créditos disponíveis
  static async getRemaining(userId) {
    const credits = await this.getByUserId(userId);
    if (!credits) return 0;
    return credits.total_videos - credits.used_videos;
  }
}

module.exports = VideoCredit;
