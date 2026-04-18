const knowledgeBase = require('../services/knowledgeBase');

exports.getRecommendation = async (req, res) => {
  const emotion = req.body?.emotion || req.query?.emotion;
  const tags = req.body?.tags || (req.query?.tags ? [req.query.tags].flat() : []);

  if (!emotion) return res.status(400).json({ error: 'Emotion is required' });

  try {
    const primaryTag = Array.isArray(tags) ? tags[0] : tags || null;
    const { recommendation } = await knowledgeBase.getRecommendation(emotion, primaryTag);
    res.json({ recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
