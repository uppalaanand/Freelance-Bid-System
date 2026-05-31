const multer = require('multer');

// Allowed MIME types for images and documents
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Multer storage configuration
 * Uses memory storage so files are available as buffers
 * for streaming upload to Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * File filter - accepts images and documents only
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed types: jpeg, jpg, png, gif, webp, pdf, doc, docx'
      ),
      false
    );
  }
};

/**
 * Base multer configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Upload a single file
 * Field name defaults to 'file'
 * @param {string} fieldName - Form field name for the file
 */
const uploadSingle = (fieldName = 'file') => upload.single(fieldName);

/**
 * Upload multiple files (max 5)
 * Field name defaults to 'files'
 * @param {string} fieldName - Form field name for the files
 * @param {number} maxCount - Maximum number of files (default 5)
 */
const uploadMultiple = (fieldName = 'files', maxCount = 5) =>
  upload.array(fieldName, maxCount);

module.exports = { uploadSingle, uploadMultiple };
