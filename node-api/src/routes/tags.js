const router = require('express').Router();
const tags = require('../controllers/tagsController');

router.get('/', tags.getTags);

module.exports = router;
