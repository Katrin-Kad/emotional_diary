const db = require('../db');
const nlpService = require('../services/nlpService');
const knowledgeBase = require('../services/knowledgeBase');

exports.createEntry = async (req, res) => {
  const { text, tags = [] } = req.body;
  const userId = req.user.id;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const { emotion, score } = await nlpService.analyzeEmotion(text);

    const entryResult = await db.query(
      'INSERT INTO entries (user_id, text, emotion, emotion_score) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, text, emotion, score]
    );
    const entryId = entryResult.rows[0].id;

    if (tags.length) {
      const tagRows = await db.query('SELECT id, name FROM tags WHERE name = ANY($1)', [tags]);
      for (const tag of tagRows.rows) {
        await db.query(
          'INSERT INTO entry_tags (entry_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [entryId, tag.id]
        );
      }
    }

    const primaryTag = tags[0] || null;
    const { recommendation } = await knowledgeBase.getRecommendation(emotion, primaryTag);

    res.json({ entryId, emotion, score, recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEntries = async (req, res) => {
  const userId = req.user.id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  try {
    const totalResult = await db.query('SELECT COUNT(*) FROM entries WHERE user_id = $1', [userId]);
    const total = parseInt(totalResult.rows[0].count);

    const result = await db.query(
      `SELECT e.id, e.text, e.emotion, e.created_at,
         COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
       FROM entries e
       LEFT JOIN entry_tags et ON et.entry_id = e.id
       LEFT JOIN tags t ON t.id = et.tag_id
       WHERE e.user_id = $1
       GROUP BY e.id
       ORDER BY e.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      data: result.rows.map((r) => ({
        id: r.id,
        text: r.text,
        emotion: r.emotion,
        tags: r.tags,
        createdAt: r.created_at,
      })),
      pagination: { page, limit, total },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEntry = async (req, res) => {
  const userId = req.user.id;
  const entryId = parseInt(req.params.id);
  if (isNaN(entryId)) return res.status(400).json({ error: 'Invalid entry id' });

  try {
    const result = await db.query(
      `SELECT e.id, e.text, e.emotion, e.emotion_score, e.created_at,
         COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
       FROM entries e
       LEFT JOIN entry_tags et ON et.entry_id = e.id
       LEFT JOIN tags t ON t.id = et.tag_id
       WHERE e.id = $1 AND e.user_id = $2
       GROUP BY e.id`,
      [entryId, userId]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'Entry not found' });

    const r = result.rows[0];
    res.json({
      id: r.id,
      text: r.text,
      emotion: r.emotion,
      score: r.emotion_score,
      tags: r.tags,
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
