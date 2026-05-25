const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const stream = require('stream');

// Multer com memory storage para enviar buffer ao Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(require('path').extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('Apenas imagens (JPG, PNG, GIF, WebP) são permitidas.'));
  }
});

// Helper: faz upload de buffer para o Cloudinary
function uploadToCloudinary(buffer, folder, resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
}

// Upload de avatar
router.post('/avatar', authenticate, (req, res) => {
  uploadImage.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Imagem muito grande. Máximo: 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    try {
      const avatarUrl = await uploadToCloudinary(req.file.buffer, 'craque-vision/avatars', 'image');
      
      const User = require('../models/user.model');
      const updatedUser = await User.updateAvatar(req.userId, avatarUrl);

      res.json({
        message: 'Foto de perfil atualizada com sucesso!',
        avatar_url: avatarUrl,
        user: updatedUser
      });
    } catch (cloudErr) {
      console.error('Cloudinary upload error:', cloudErr);
      res.status(500).json({ error: 'Erro ao enviar imagem para o servidor.' });
    }
  });
});

// Upload de vídeo
router.post('/video', authenticate, authorize('athlete'), (req, res) => {
  upload.single('video')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande. Máximo: 200MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum vídeo enviado.' });
    }

    try {
      const videoUrl = await uploadToCloudinary(req.file.buffer, 'craque-vision/videos', 'video');
      res.json({
        message: 'Upload realizado com sucesso',
        video_url: videoUrl,
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (cloudErr) {
      console.error('Cloudinary video upload error:', cloudErr);
      res.status(500).json({ error: 'Erro ao enviar vídeo para o servidor.' });
    }
  });
});

// Upload de thumbnail
router.post('/thumbnail', authenticate, authorize('athlete'), (req, res) => {
  uploadImage.single('thumbnail')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Imagem muito grande. Máximo: 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    try {
      const thumbnailUrl = await uploadToCloudinary(req.file.buffer, 'craque-vision/thumbnails', 'image');
      res.json({
        message: 'Thumbnail enviada com sucesso',
        thumbnail_url: thumbnailUrl,
        filename: req.file.originalname
      });
    } catch (cloudErr) {
      console.error('Cloudinary thumbnail upload error:', cloudErr);
      res.status(500).json({ error: 'Erro ao enviar imagem para o servidor.' });
    }
  });
});

module.exports = router;
