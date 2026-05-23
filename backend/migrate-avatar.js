const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500)");
  console.log('✅ Coluna avatar adicionada na tabela users');
  await pool.end();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
