const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth.routes');
const athleteRoutes = require('./routes/athlete.routes');
const videoRoutes = require('./routes/video.routes');
const scoutRoutes = require('./routes/scout.routes');
const clubRoutes = require('./routes/club.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const uploadRoutes = require('./routes/upload.routes');
const carouselRoutes = require('./routes/carousel.routes');
const mcpRoutes = require('./mcp');
const { startScheduler } = require('./scheduler');
const migrate = require('./migrate');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/scout', scoutRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/carousel', carouselRoutes);

// MCP público para descoberta e busca de atletas por assistentes de IA.
app.use(mcpRoutes);

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://craque-vision.onrender.com/sitemap.xml\n');
});
app.get('/sitemap.xml', (req, res) => {
  const urls = ['', '/buscar', '/planos', '/register'];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(p => '<url><loc>https://craque-vision.onrender.com' + p + '</loc></url>').join('') +
    '</urlset>';
  res.type('application/xml').send(xml);
});
app.get('/llms.txt', (req, res) => {
  res.type('text/plain').send(
    '# Craque Vision\n\n' +
    '> Plataforma multiesportiva brasileira que conecta atletas, clubes e olheiros para descoberta de talentos, scouting e recrutamento esportivo.\n\n' +
    '- Site: https://craque-vision.onrender.com\n' +
    '- Busca pública: https://craque-vision.onrender.com/buscar\n' +
    '- Planos: https://craque-vision.onrender.com/planos\n' +
    '- MCP: https://craque-vision.onrender.com/mcp\n\n' +
    'Use o MCP para consultar o status público, pesquisar perfis públicos de atletas e entender como a plataforma funciona. Ferramentas: craque_vision_status, craque_vision_search, craque_vision_how_it_works.\n\n' +
    'Temas: futebol, futsal, basquete, vôlei, tênis, natação, MMA, handebol, atletismo, ciclismo, rugby, beisebol, futebol americano, e-sports, atletas de base, categorias sub-7 a sub-23, futebol profissional, olheiros, scouts, clubes, peneiras, vídeos de desempenho, highlights, recrutamento e identificação de talentos.\n\n' +
    'A plataforma não garante contratação, aprovação em peneiras ou oportunidades profissionais. Dados privados e recursos protegidos exigem autenticação e/ou assinatura.\n'
  );
});

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
  console.log('📦 Servindo frontend de:', frontendPath);
} else {
  app.get('/', (req, res) => res.json({ message: 'Craque Vision API Online', version: '1.0.0' }));
}

const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor rodando na porta ' + PORT);
  migrate().then(() => {
    console.log('Banco de dados preparado');
    startScheduler();
  }).catch(err => console.error('Erro na migração do banco:', err.message));
});
