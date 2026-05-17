const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getStrategies } = require('../controllers/strategiesController');

router.get('/', authMiddleware, getStrategies);

module.exports = router;
