const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Configuração do multer para comprovantes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'payments');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('Apenas imagens (JPG, PNG, GIF, WebP) ou PDF são permitidos.'));
  }
});

router.get('/subscription-plans', paymentController.getSubscriptionPlans);
router.get('/pix-info', paymentController.getPixInfo);
router.post('/subscription', authenticate, paymentController.createSubscriptionPayment);
router.post('/subscription/proof', authenticate, upload.single('proof'), paymentController.uploadSubscriptionProof);
router.get('/subscription/status', authenticate, paymentController.getMySubscriptionStatus);
router.post('/confirm', authenticate, paymentController.confirmPayment);

// Admin
router.put('/subscription/:id/approve', authenticate, authorize('admin'), paymentController.approveSubscription);
router.put('/subscription/:id/reject', authenticate, authorize('admin'), paymentController.rejectSubscription);
router.get('/subscription/pending', authenticate, authorize('admin'), paymentController.getPendingSubscriptions);

module.exports = router;
