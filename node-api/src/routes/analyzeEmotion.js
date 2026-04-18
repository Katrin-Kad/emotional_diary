const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const nlpService = require('../services/nlpService');

router.post('/', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  try {
    const result = await nlpService.analyzeEmotion(text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'NLP service unavailable' });
  }
});

module.exports = router;
