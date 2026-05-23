const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que as pastas uploads existem
const uploadsDir = path.join(__dirname, '..', 'uploads', 'videos');
const thumbnailsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Filtro: aceita apenas vídeos
const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de vídeo não suportado. Use MP4, WebM, MOV, AVI, MKV ou OGG.'), false);
  }
};

// Filtro: aceita apenas imagens
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagem não suportado. Use JPEG, PNG, WebP ou GIF.'), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thumbnailsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `thumb-${uniqueSuffix}${ext}`);
  }
});

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB máximo
  }
});

const uploadThumbnail = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

module.exports = { uploadVideo, uploadThumbnail, uploadsDir, thumbnailsDir };
