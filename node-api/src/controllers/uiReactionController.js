const knowledgeBase = require('../services/knowledgeBase');

exports.getUiReaction = async (req, res) => {
  const emotion = req.body?.emotion || req.query?.emotion;
  if (!emotion) return res.status(400).json({ error: 'Emotion is required' });

  try {
    const reaction = await knowledgeBase.getUiReaction(emotion);
    res.json(reaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
