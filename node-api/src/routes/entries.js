const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const entries = require('../controllers/entriesController');

router.post('/', authMiddleware, entries.createEntry);
router.get('/', authMiddleware, entries.getEntries);
router.get('/:id', authMiddleware, entries.getEntry);

module.exports = router;
