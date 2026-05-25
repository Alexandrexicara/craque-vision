const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const stream = require('stream');
const Carousel = require('../models/carousel.model');

// Upload de imagem para Cloudinary via memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(require('path').extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('Apenas imagens (JPG, PNG, GIF, WebP) são permitidas.'));
  }
});

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
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

// Público: listar imagens ativas do carrossel
router.get('/', async (req, res) => {
  try {
    const images = await Carousel.getAll();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: listar todas (inclui inativas)
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const images = await Carousel.getAllAdmin();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: adicionar imagem
router.post('/', authenticate, authorize('admin'), (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

    try {
      const image_url = await uploadToCloudinary(req.file.buffer, 'craque-vision/carousel');
      const item = await Carousel.create({
        image_url,
        title: req.body.title,
        link: req.body.link,
        sort_order: parseInt(req.body.sort_order) || 0
      });
      res.status(201).json({ message: 'Imagem adicionada ao carrossel!', item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Admin: atualizar imagem
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = {};
    if (req.body.title !== undefined) fields.title = req.body.title;
    if (req.body.link !== undefined) fields.link = req.body.link;
    if (req.body.is_active !== undefined) fields.is_active = req.body.is_active === 'true' || req.body.is_active === true;
    if (req.body.sort_order !== undefined) fields.sort_order = parseInt(req.body.sort_order);

    const updated = await Carousel.update(id, fields);
    if (!updated) return res.status(404).json({ error: 'Item não encontrado.' });
    res.json({ message: 'Item atualizado!', item: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: deletar imagem
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Carousel.delete(req.params.id);
    res.json({ message: 'Imagem removida do carrossel.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
