const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const stats = require('../controllers/statsController');

router.get('/emotions', authMiddleware, stats.getEmotionStats);
router.get('/tags', authMiddleware, stats.getTagStats);
router.get('/trends', authMiddleware, stats.getTrends);

module.exports = router;
