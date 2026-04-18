const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const rec = require('../controllers/recommendationController');

router.get('/', authMiddleware, rec.getRecommendation);

module.exports = router;
