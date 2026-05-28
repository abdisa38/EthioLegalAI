const multer = require("multer");

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = {
  upload,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};
