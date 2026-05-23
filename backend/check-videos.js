const pool = require('./config/database');

async function check() {
  try {
    const r = await pool.query('SELECT id, title, status, substring(video_url,1,40) as url_preview FROM videos ORDER BY id');
    process.stdout.write(JSON.stringify(r.rows, null, 2) + '\n');
  } catch(e) {
    process.stderr.write('ERRO: ' + e.message + '\n');
  }
  pool.end();
}

check();
