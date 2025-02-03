const express = require('express');
const { getAllPredefinedBlocks, createPredefinedBlock } = require('../controllers/predefinedBlockController');
const { parseFormData } = require('../utils/multer'); // Import fixed Multer middleware
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate(),getAllPredefinedBlocks);
router.post('/', authenticate(true), parseFormData, createPredefinedBlock);

module.exports = router;
