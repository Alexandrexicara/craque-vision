require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const jwt = require('jsonwebtoken');
const http = require('http');
const fs = require('fs');

// Gera token de admin (userId=3)
const token = jwt.sign({ userId: 3 }, process.env.JWT_SECRET, { expiresIn: '1m' });
const log = [];

function request(path, label) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(body);
          log.push(`${label}: canWatch=${j.canWatch}, videos=${j.videos?.length || 'N/A'}, url=${!!j.videos?.[0]?.video_url}`);
        } catch(e) {
          log.push(`${label}: ERROR parsing - ${body.substring(0,100)}`);
        }
        resolve();
      });
    }).on('error', e => {
      log.push(`${label}: HTTP ERROR - ${e.message}`);
      resolve();
    });
  });
}

async function main() {
  // 1. Testar sem token (anônimo)
  await new Promise((resolve, reject) => {
    http.get('http://localhost:5000/api/videos/public/featured?limit=1', res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const j = JSON.parse(body);
        log.push(`ANONIMO: canWatch=${j.canWatch}, locked=${j.videos?.[0]?.locked}`);
        resolve();
      });
    }).on('error', e => { log.push('ANONIMO: ERROR'); resolve(); });
  });

  // 2. Testar com token admin
  await request('/api/videos/public/featured?limit=1', 'ADMIN');
  
  // Resultados
  fs.writeFileSync(__dirname + '/test-result.txt', log.join('\n'));
  process.exit(0);
}

main();
