const express = require('express');
const multer = require('multer');
const imageController = require('../Controllers/imageController');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', upload.single('file'), imageController.uploadCsv);
router.get('/status/:requestId', imageController.getStatus);

module.exports = router;
