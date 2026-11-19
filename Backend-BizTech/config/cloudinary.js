require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure storage for general assets (products, categories, expenses)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'biztech',
    allowedFormats: ['jpg', 'png', 'jpeg', 'pdf', 'webp'],
  }
});

const upload = multer({ storage: storage });

// Configure storage for documents & statutory images (PAN, GSTIN, MSME, FSSAI, certificates, invoices, etc.)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const cleanName = (file.originalname || 'document')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return {
      folder: 'biztech/documents',
      resource_type: 'auto',
      public_id: `${cleanName}-${uniqueSuffix}`
    };
  }
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Configure storage for payment proofs (screenshots & receipts)
const paymentProofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const cleanName = (file.originalname || 'proof')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return {
      folder: 'biztech/payment-proofs',
      resource_type: 'auto',
      public_id: `proof-${cleanName}-${uniqueSuffix}`
    };
  }
});

const uploadPaymentProof = multer({
  storage: paymentProofStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max
});

module.exports = { cloudinary, upload, uploadDocument, uploadPaymentProof };
