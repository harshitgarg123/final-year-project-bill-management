const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const billsDir = path.join(__dirname, '..', 'uploads', 'bills');
const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');

[billsDir, profilesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Bill file storage
const billStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, billsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bill-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Profile image storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for bills
const billFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, JPG, PNG, DOC files are allowed'));
};

// File filter for profile images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed'));
};

const uploadBill = multer({
  storage: billStorage,
  fileFilter: billFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { uploadBill, uploadProfile };
