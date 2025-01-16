const express = require('express');
const { upload } = require('../utils/multer'); // Import the fixed `upload` function
const { uploadImage } = require('../controllers/uploadController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/', authenticate(true), upload, uploadImage);

module.exports = router;
