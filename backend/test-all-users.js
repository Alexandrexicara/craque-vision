require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const jwt = require('jsonwebtoken');
const http = require('http');
const fs = require('fs');

const log = [];
let tokenAthlete, tokenAdmin;

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1m' });
}

function request(path, label, token) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost', port: 5000, path,
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    };
    http.get(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(body);
          log.push(`${label}: canWatch=${j.canWatch}, videos=${j.videos?.length||0}, url=${!!j.videos?.[0]?.video_url}, locked=${j.videos?.[0]?.locked}`);
        } catch(e) {
          log.push(`${label}: PARSE_ERR`);
        }
        resolve();
      });
    }).on('error', e => { log.push(`${label}: ERR`); resolve(); });
  });
}

async function main() {
  tokenAdmin = makeToken(3);
  tokenAthlete = makeToken(4);

  await request('/api/videos/public/featured?limit=1', 'ANONIMO', null);
  await request('/api/videos/public/featured?limit=1', 'ADMIN(3)', tokenAdmin);
  await request('/api/videos/public/featured?limit=1', 'ATLETA(4)', tokenAthlete);

  fs.writeFileSync(__dirname + '/test-all.txt', log.join('\n'));
  process.exit(0);
}
main();
