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
  await pool.query("ALTER TABLE videos ADD COLUMN IF NOT EXISTS payment_proof TEXT");
  console.log('✅ Coluna payment_proof adicionada');
  await pool.query("DROP TABLE IF EXISTS video_credits");
  console.log('✅ Tabela video_credits removida');
  await pool.end();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
