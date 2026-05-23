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
const { startScheduler } = require('./scheduler');

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (vídeos enviados)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/scout', scoutRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

// Em produção, serve o frontend compilado (SPA)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  console.log('📦 Servindo frontend de:', frontendPath);
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Craque Vision API Online',
      version: '1.0.0'
    });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startScheduler();
});
