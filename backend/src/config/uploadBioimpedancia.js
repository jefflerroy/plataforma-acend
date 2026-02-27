const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'bioimpedancia');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname || '.pdf');
        const hash = crypto.randomBytes(16).toString('hex');
        cb(null, `${Date.now()}-${hash}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    const ok = file.mimetype === 'application/pdf';
    if (!ok) return cb(new Error('Envie um arquivo PDF.'), false);
    cb(null, true);
}

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 },
});