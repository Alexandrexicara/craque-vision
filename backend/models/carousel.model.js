const pool = require('../config/database');

class Carousel {
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM carousel WHERE is_active = true ORDER BY sort_order ASC, created_at DESC'
    );
    return result.rows;
  }

  static async getAllAdmin() {
    const result = await pool.query(
      'SELECT * FROM carousel ORDER BY sort_order ASC, created_at DESC'
    );
    return result.rows;
  }

  static async create({ image_url, title, link, sort_order }) {
    const result = await pool.query(
      `INSERT INTO carousel (image_url, title, link, sort_order) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [image_url, title || null, link || null, sort_order || 0]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const sets = [];
    const values = [];
    let i = 0;
    for (const [k, v] of Object.entries(fields)) {
      i++;
      sets.push(`${k} = $${i}`);
      values.push(v);
    }
    if (sets.length === 0) return null;
    i++;
    values.push(id);
    const result = await pool.query(
      `UPDATE carousel SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM carousel WHERE id = $1', [id]);
  }
}

module.exports = Carousel;
