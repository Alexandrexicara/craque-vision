const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, user_type } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, user_type, email_verified, is_active)
      VALUES ($1, $2, $3, $4, false, true)
      RETURNING id, name, email, user_type, avatar, created_at
    `;
    
    const values = [name, email, hashedPassword, user_type];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, name, email, user_type, avatar, created_at 
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateAvatar(id, avatarUrl) {
    const query = `
      UPDATE users SET avatar = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, user_type, avatar, created_at
    `;
    const result = await pool.query(query, [avatarUrl, id]);
    return result.rows[0];
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
