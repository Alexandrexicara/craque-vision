const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function migrate() {
  console.log('🔧 Verificando tabelas...');

  // Verifica se a tabela users tem id como PRIMARY KEY
  let needsReset = false;
  try {
    const check = await pool.query(
      `SELECT kcu.column_name 
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
       WHERE tc.table_name = 'users' AND tc.constraint_type = 'PRIMARY KEY' AND kcu.column_name = 'id'`
    );
    // users existe mas id NÃO é primary key → schema corrompido
    if (check.rows.length === 0) needsReset = true;
  } catch (e) {
    // users não existe → vai criar normalmente
  }

  // Se o schema estiver corrompido, recria tudo (banco vazio no Render)
  if (needsReset) {
    console.log('⚠️ Schema corrompido detectado, recriando tabelas...');
    await pool.query('DROP TABLE IF EXISTS likes CASCADE');
    await pool.query('DROP TABLE IF EXISTS favorites CASCADE');
    await pool.query('DROP TABLE IF EXISTS payments CASCADE');
    await pool.query('DROP TABLE IF EXISTS subscriptions CASCADE');
    await pool.query('DROP TABLE IF EXISTS videos CASCADE');
    await pool.query('DROP TABLE IF EXISTS athletes CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
  }

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

  // Cria admin padrão se não existir
  const adminExists = await pool.query("SELECT id FROM users WHERE email = 'admin@celio.com'");
  if (adminExists.rows.length === 0) {
    const hash = bcrypt.hashSync('celio48', 10);
    await pool.query(
      "INSERT INTO users (name, email, password, user_type) VALUES ($1, $2, $3, $4)",
      ['Administrador', 'admin@celio.com', hash, 'admin']
    );
    console.log('👤 Admin criado: admin@celio.com / celio48');
  }
}

module.exports = migrate;
