const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupAdmin() {
  try {
    // Remove admin antigo
    await pool.query("DELETE FROM users WHERE email = 'admin@celio.com'");
    console.log('✅ Admin antigo removido');

    // Gera hash fresco
    const hash = bcrypt.hashSync('celio48', 10);
    console.log('🔑 Hash gerado:', hash.substring(0, 30) + '...');

    // Insere novo admin
    const result = await pool.query(
      'INSERT INTO users (name, email, password, user_type) VALUES ($1, $2, $3, $4) RETURNING id, name, email, user_type',
      ['Administrador', 'admin@celio.com', hash, 'admin']
    );
    console.log('✅ Admin criado:', result.rows[0]);

    // Verifica
    const check = await pool.query("SELECT id, email, user_type FROM users WHERE email = 'admin@celio.com'");
    console.log('🔍 Verificação:', check.rows[0]);
    
    // Testa bcrypt
    const user = check.rows[0];
    const fullUser = await pool.query("SELECT password FROM users WHERE email = 'admin@celio.com'");
    const isValid = bcrypt.compareSync('celio48', fullUser.rows[0].password);
    console.log('🔐 Senha válida?', isValid);

    await pool.end();
    console.log('✅ Pronto!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setupAdmin();
