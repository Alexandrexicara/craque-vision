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
  await pool.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_proof TEXT");
  console.log('✅ payment_proof adicionado em subscriptions');
  
  await pool.query("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'");
  console.log('✅ payment_status adicionado (pending/approved/rejected)');
  
  await pool.end();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
