const cloudinary = require('cloudinary').v2;

// Aceita CLOUDINARY_URL (ex: cloudinary://api_key:api_secret@cloud_name)
// ou as 3 variáveis separadas
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = cloudinary;
