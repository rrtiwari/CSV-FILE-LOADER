const express = require('express');
const multer = require('multer');
const { uploadCsv, getCsvData } = require('../controllers/csvController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadCsv);
router.get('/data', getCsvData);

module.exports = router;