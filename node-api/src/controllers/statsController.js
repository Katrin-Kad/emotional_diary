const db = require('../db');

const EMOTIONS = ['нейтральный', 'счастье', 'грусть', 'энтузиазм', 'страх', 'гнев', 'отвращение'];

exports.getEmotionStats = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  try {
    const params = [userId];
    let query = 'SELECT emotion, COUNT(*) FROM entries WHERE user_id = $1';
    if (date) {
      query += ' AND DATE(created_at) = $2';
      params.push(date);
    }
    query += ' GROUP BY emotion';

    const result = await db.query(query, params);
    const stats = Object.fromEntries(EMOTIONS.map((e) => [e, 0]));
    for (const row of result.rows) {
      if (Object.prototype.hasOwnProperty.call(stats, row.emotion)) {
        stats[row.emotion] = parseInt(row.count);
      }
    }
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTagStats = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  try {
    const params = [userId];
    let query = `SELECT t.name, COUNT(*) FROM entries e
      JOIN entry_tags et ON et.entry_id = e.id
      JOIN tags t ON t.id = et.tag_id
      WHERE e.user_id = $1`;
    if (date) {
      query += ' AND DATE(e.created_at) = $2';
      params.push(date);
    }
    query += ' GROUP BY t.name';

    const result = await db.query(query, params);
    const stats = {};
    for (const row of result.rows) {
      stats[row.name] = parseInt(row.count);
    }
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTrends = async (req, res) => {
  const userId = req.user.id;
  const { from, to } = req.query;

  try {
    const params = [userId];
    let query = 'SELECT DATE(created_at) AS date, emotion FROM entries WHERE user_id = $1';
    if (from) {
      params.push(from);
      query += ` AND DATE(created_at) >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      query += ` AND DATE(created_at) <= $${params.length}`;
    }
    query += ' ORDER BY date ASC';

    const result = await db.query(query, params);
    res.json(result.rows.map((r) => ({ date: r.date, emotion: r.emotion })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
