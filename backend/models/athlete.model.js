const pool = require('../config/database');

class Athlete {
  static async create(athleteData) {
    const {
      user_id, sport, category, position, weight, height,
      city, state, country, birth_date, dominant_foot,
      current_club, bio, description, goals,
      whatsapp, instagram, profile_photo
    } = athleteData;

    const query = `
      INSERT INTO athletes (
        user_id, sport, category, position, weight, height,
        city, state, country, birth_date, dominant_foot,
        current_club, bio, description, goals,
        whatsapp, instagram, profile_photo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      user_id, sport, category, position, weight, height,
      city, state, country, birth_date, dominant_foot,
      current_club, bio, description, goals,
      whatsapp, instagram, profile_photo
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT a.*, u.name, u.email, u.avatar
      FROM athletes a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT a.*, u.name, u.email, u.avatar
      FROM athletes a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async search(filters) {
    let query = `
      SELECT a.*, u.name, u.avatar
      FROM athletes a 
      JOIN users u ON a.user_id = u.id 
      WHERE u.is_active = true
    `;
    const values = [];
    let paramCount = 0;

    // Busca unificada: nome, posição, esporte, cidade
    if (filters.q) {
      paramCount++;
      query += ` AND (
        u.name ILIKE $${paramCount} OR 
        a.position ILIKE $${paramCount} OR 
        a.sport ILIKE $${paramCount} OR
        a.city ILIKE $${paramCount} OR
        a.current_club ILIKE $${paramCount}
      )`;
      values.push(`%${filters.q}%`);
    }
    if (filters.sport) {
      paramCount++;
      query += ` AND a.sport ILIKE $${paramCount}`;
      values.push(`%${filters.sport}%`);
    }
    if (filters.category) {
      paramCount++;
      query += ` AND a.category ILIKE $${paramCount}`;
      values.push(`%${filters.category}%`);
    }
    if (filters.state) {
      paramCount++;
      query += ` AND a.state ILIKE $${paramCount}`;
      values.push(`%${filters.state}%`);
    }
    if (filters.position) {
      paramCount++;
      query += ` AND a.position ILIKE $${paramCount}`;
      values.push(`%${filters.position}%`);
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async update(id, athleteData) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(athleteData)) {
      if (value !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    paramCount++;
    values.push(id);

    const query = `
      UPDATE athletes 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Athlete;
