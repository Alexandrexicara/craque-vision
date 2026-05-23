const pool = require('../config/database');

class Like {
  static async create(likeData) {
    const { user_id, video_id } = likeData;

    const query = `
      INSERT INTO likes (user_id, video_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [user_id, video_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByVideoId(videoId) {
    const query = `
      SELECT l.*, u.name 
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.video_id = $1
      ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query, [videoId]);
    return result.rows;
  }

  static async findByUserAndVideo(userId, videoId) {
    const query = `
      SELECT * FROM likes 
      WHERE user_id = $1 AND video_id = $2
    `;
    const result = await pool.query(query, [userId, videoId]);
    return result.rows[0];
  }

  static async countByVideoId(videoId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM likes 
      WHERE video_id = $1
    `;
    const result = await pool.query(query, [videoId]);
    return parseInt(result.rows[0].count);
  }

  static async delete(userId, videoId) {
    const query = `
      DELETE FROM likes 
      WHERE user_id = $1 AND video_id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [userId, videoId]);
    return result.rows[0];
  }
}

module.exports = Like;
