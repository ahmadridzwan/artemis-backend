const express = require('express');
const { getUserBlocks, selectUserBlocks, removeUserBlock } = require('../controllers/userBlockController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// User must be logged in to access these routes
router.get('/', authenticate(), getUserBlocks);
router.post('/add', authenticate(), selectUserBlocks);
router.post('/remove', authenticate(), removeUserBlock);

module.exports = router;
