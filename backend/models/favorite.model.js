const pool = require('../config/database');

class Favorite {
  static async create(favoriteData) {
    const { user_id, athlete_id } = favoriteData;

    const query = `
      INSERT INTO favorites (user_id, athlete_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [user_id, athlete_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT f.*, a.*, u.name as athlete_name
      FROM favorites f
      JOIN athletes a ON f.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByUserAndAthlete(userId, athleteId) {
    const query = `
      SELECT * FROM favorites 
      WHERE user_id = $1 AND athlete_id = $2
    `;
    const result = await pool.query(query, [userId, athleteId]);
    return result.rows[0];
  }

  static async delete(userId, athleteId) {
    const query = `
      DELETE FROM favorites 
      WHERE user_id = $1 AND athlete_id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [userId, athleteId]);
    return result.rows[0];
  }
}

module.exports = Favorite;
