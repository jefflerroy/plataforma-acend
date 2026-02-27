const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'exames');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const name = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${ext}`;
        cb(null, name);
    },
});

module.exports = multer({ storage });