const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const hash = bcrypt.hashSync('celio48', 10);

pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'admin@celio.com'])
  .then(() => {
    process.stdout.write('✅ Senha do admin redefinida para: celio48\n');
    pool.end();
    process.exit(0);
  })
  .catch(e => {
    process.stderr.write('ERRO: ' + e.message + '\n');
    pool.end();
    process.exit(1);
  });
