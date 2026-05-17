const knowledgeBase = require('../services/knowledgeBase');

exports.getStrategies = async (req, res) => {
  const { emotion, tag } = req.query;
  if (!emotion) return res.status(400).json({ error: 'emotion is required' });
  try {
    const strategies = await knowledgeBase.getStrategies(emotion, tag || null);
    res.json(strategies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
