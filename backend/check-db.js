const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  try {
    const r = await pool.query("SELECT id, title, status FROM videos");
    console.log(JSON.stringify(r.rows));
    const s = await pool.query("SELECT id, is_active, user_id FROM subscriptions");
    console.log(JSON.stringify(s.rows));
  } catch(e) {
    console.error('ERRO:', e.message);
  }
  await pool.end();
  process.exit(0);
}

main();
