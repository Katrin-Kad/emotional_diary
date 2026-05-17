const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const stats = require('../controllers/statsController');

router.get('/summary', authMiddleware, stats.getSummary);
router.get('/emotions', authMiddleware, stats.getEmotionStats);
router.get('/tags', authMiddleware, stats.getTagStats);
router.get('/trends', authMiddleware, stats.getTrends);
router.get('/insight', authMiddleware, stats.getInsight);

module.exports = router;
