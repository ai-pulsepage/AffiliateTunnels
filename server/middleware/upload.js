const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf',
    'text/plain', 'text/csv', 'text/html',
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB — server has 32GB RAM, memoryStorage is fine

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed`), false);
        }
    },
});

module.exports = { upload };
