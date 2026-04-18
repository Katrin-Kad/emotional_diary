const knowledgeBase = require('../services/knowledgeBase');

exports.getUiReaction = (req, res) => {
  const emotion = req.body?.emotion || req.query?.emotion;
  if (!emotion) return res.status(400).json({ error: 'Emotion is required' });

  const reaction = knowledgeBase.getUiReaction(emotion);
  res.json(reaction);
};
