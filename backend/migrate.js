const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function migrate() {
  console.log('🔧 Verificando tabelas...');

  // Migração não destrutiva: nunca remover tabelas ou registros automaticamente.
  // As tabelas ausentes são criadas abaixo com IF NOT EXISTS.

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('athlete', 'scout', 'club', 'admin')),
      email_verified BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      avatar VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS athletes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sport VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      position VARCHAR(100),
      dominant_foot VARCHAR(20) CHECK (dominant_foot IN ('left', 'right', 'both')),
      weight VARCHAR(50),
      height VARCHAR(50),
      birth_date DATE,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100) DEFAULT 'Brasil',
      whatsapp VARCHAR(50),
      instagram VARCHAR(100),
      current_club VARCHAR(255),
      historic TEXT,
      profile_photo TEXT,
      bio TEXT,
      description TEXT,
      goals TEXT,
      is_public BOOLEAN DEFAULT TRUE,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
      video_url TEXT NOT NULL,
      thumbnail TEXT,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(100),
      description TEXT,
      views INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      rejection_reason TEXT,
      payment_proof TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      plan_name VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending_payment')),
      expires_at TIMESTAMP,
      payment_id VARCHAR(255),
      payment_proof TEXT,
      payment_status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL CHECK (type IN ('video_package', 'subscription')),
      package_type VARCHAR(100),
      plan_name VARCHAR(100),
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'BRL',
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method VARCHAR(50),
      external_payment_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, athlete_id)
    )`,

    `CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, video_id)
    )`,

    `CREATE TABLE IF NOT EXISTS carousel (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      title VARCHAR(255),
      link VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    await pool.query(sql);
  }
  console.log('✅ Tabelas verificadas/criadas');
  await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255)');
  await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS merchant_code VARCHAR(100)');
  await pool.query('CREATE INDEX IF NOT EXISTS payments_external_payment_id_idx ON payments(external_payment_id) WHERE external_payment_id IS NOT NULL');

  // Cria ou atualiza a senha administrativa somente com segredo configurado no Render.
  // Nunca registrar senha ou credenciais nos logs.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);
    const adminExists = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [process.env.ADMIN_EMAIL]
    );
    if (adminExists.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (name, email, password, user_type) VALUES ($1, $2, $3, $4)',
        ['Administrador', process.env.ADMIN_EMAIL, hash, 'admin']
      );
      console.log('👤 Administrador inicial criado');
    } else {
      await pool.query(
        "UPDATE users SET password = $1, user_type = 'admin', updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = LOWER($2)",
        [hash, process.env.ADMIN_EMAIL]
      );
      console.log('🔐 Credenciais do administrador atualizadas');
    }
  }
}

module.exports = migrate;
