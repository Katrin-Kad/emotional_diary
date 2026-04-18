const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const ui = require('../controllers/uiReactionController');

router.get('/', authMiddleware, ui.getUiReaction);

module.exports = router;
