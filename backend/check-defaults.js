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
  // Check defaults on email_verified and is_active
  const r = await pool.query(`
    SELECT column_name, column_default, is_nullable 
    FROM information_schema.columns 
    WHERE table_name='users' AND column_name IN ('email_verified', 'is_active')
  `);
  console.log('Defaults:', JSON.stringify(r.rows, null, 2));
  
  // Check subscriptions
  const s = await pool.query("SELECT * FROM subscriptions");
  console.log('Subscriptions:', JSON.stringify(s.rows, null, 2));
  
  await pool.end();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
