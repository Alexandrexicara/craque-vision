const express = require('express');
const router = express.Router();
const { uploadVideo, uploadThumbnail } = require('../config/upload');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para avatar
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('Apenas imagens (JPG, PNG, GIF, WebP) são permitidas.'));
  }
});

// Upload de avatar (qualquer usuário autenticado)
router.post('/avatar', authenticate, (req, res) => {
  uploadAvatar.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Imagem muito grande. Máximo: 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Atualiza o avatar no banco
    const User = require('../models/user.model');
    const updatedUser = await User.updateAvatar(req.userId, avatarUrl);

    res.json({
      message: 'Foto de perfil atualizada com sucesso!',
      avatar_url: avatarUrl,
      user: updatedUser
    });
  });
});

// Upload de vídeo
router.post('/video', authenticate, authorize('athlete'), (req, res) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande. Máximo: 200MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum vídeo enviado.' });
    }

    // Retorna o caminho do vídeo salvo
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    res.json({
      message: 'Upload realizado com sucesso',
      video_url: videoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

// Upload de thumbnail
router.post('/thumbnail', authenticate, authorize('athlete'), (req, res) => {
  uploadThumbnail.single('thumbnail')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Imagem muito grande. Máximo: 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
    res.json({
      message: 'Thumbnail enviada com sucesso',
      thumbnail_url: thumbnailUrl,
      filename: req.file.filename
    });
  });
});

module.exports = router;
