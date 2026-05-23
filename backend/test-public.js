const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ userId: 3 }, process.env.JWT_SECRET, { expiresIn: '1m' });

const http = require('http');
const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/videos/public/featured?limit=2',
  headers: { 'Authorization': 'Bearer ' + token }
};

http.get(opts, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const j = JSON.parse(body);
    process.stdout.write('canWatch: ' + j.canWatch + '\n');
    process.stdout.write('videos: ' + j.videos.length + '\n');
    process.stdout.write('url: ' + (j.videos[0]?.video_url ? 'PRESENTE' : 'NULO') + '\n');
    process.stdout.write('locked: ' + (j.videos[0]?.locked) + '\n');
    process.exit(0);
  });
}).on('error', e => { process.stderr.write(e.message + '\n'); process.exit(1); });
