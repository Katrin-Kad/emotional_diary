const db = require('../db');
const knowledgeBase = require('../services/knowledgeBase');

const EMOTIONS = ['нейтральный', 'счастье', 'грусть', 'энтузиазм', 'страх', 'гнев', 'отвращение'];
const TAGS = ['учёба', 'работа', 'отношения', 'здоровье', 'друзья', 'семья', 'отдых'];

exports.getSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const [totalRes, daysRes, datesRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM entries WHERE user_id = $1', [userId]),
      db.query('SELECT COUNT(DISTINCT DATE(created_at)) FROM entries WHERE user_id = $1', [userId]),
      db.query('SELECT DISTINCT DATE(created_at) as d FROM entries WHERE user_id = $1 ORDER BY d DESC', [userId]),
    ]);

    let streak = 0;
    const dates = datesRes.rows.map(r =>
      (r.d instanceof Date ? r.d : new Date(r.d)).toISOString().slice(0, 10)
    );
    if (dates.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let current = dates[0] === today ? today : dates[0] === yesterday ? yesterday : null;
      if (current) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const d = new Date(current + 'T00:00:00Z');
          d.setUTCDate(d.getUTCDate() - 1);
          const prev = d.toISOString().slice(0, 10);
          if (dates[i] === prev) { streak++; current = prev; } else break;
        }
      }
    }

    res.json({
      totalEntries: parseInt(totalRes.rows[0].count),
      activeDays: parseInt(daysRes.rows[0].count),
      streak,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEmotionStats = async (req, res) => {
  const userId = req.user.id;
  const { date, tag } = req.query;

  try {
    let query, params;

    if (tag === 'другое') {
      params = [userId];
      query = `SELECT e.emotion, COUNT(*) FROM entries e
        WHERE e.user_id = $1
        AND NOT EXISTS (SELECT 1 FROM entry_tags et WHERE et.entry_id = e.id)`;
      if (date) { query += ' AND DATE(e.created_at) = $2'; params.push(date); }
      query += ' GROUP BY e.emotion';
    } else if (tag) {
      params = [userId, tag];
      query = `SELECT e.emotion, COUNT(*) FROM entries e
        JOIN entry_tags et ON et.entry_id = e.id
        JOIN tags t ON t.id = et.tag_id
        WHERE e.user_id = $1 AND t.name = $2`;
      if (date) { query += ' AND DATE(e.created_at) = $3'; params.push(date); }
      query += ' GROUP BY e.emotion';
    } else {
      params = [userId];
      query = 'SELECT emotion, COUNT(*) FROM entries WHERE user_id = $1';
      if (date) { query += ' AND DATE(created_at) = $2'; params.push(date); }
      query += ' GROUP BY emotion';
    }

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
    query += ' GROUP BY t.name ORDER BY COUNT(*) DESC';

    const [result, otherRes] = await Promise.all([
      db.query(query, params),
      db.query(
        `SELECT COUNT(*) FROM entries e WHERE e.user_id = $1
         AND NOT EXISTS (SELECT 1 FROM entry_tags et WHERE et.entry_id = e.id)`,
        [userId]
      ),
    ]);
    const stats = Object.fromEntries(TAGS.map((t) => [t, 0]));
    for (const row of result.rows) {
      if (Object.prototype.hasOwnProperty.call(stats, row.name)) {
        stats[row.name] = parseInt(row.count);
      }
    }
    stats['другое'] = parseInt(otherRes.rows[0].count);
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
    let query = `SELECT DATE(created_at) AS date, emotion, COUNT(*) AS cnt
      FROM entries WHERE user_id = $1`;
    if (from) { params.push(from); query += ` AND DATE(created_at) >= $${params.length}`; }
    if (to)   { params.push(to);   query += ` AND DATE(created_at) <= $${params.length}`; }
    query += ' GROUP BY DATE(created_at), emotion ORDER BY date ASC';

    const result = await db.query(query, params);

    const byDate = {};
    for (const row of result.rows) {
      const d = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10);
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push({ emotion: row.emotion, cnt: parseInt(row.cnt) });
    }

    const trends = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, emotions]) => {
        const maxCnt = Math.max(...emotions.map((e) => e.cnt));
        return { date, emotions: emotions.filter((e) => e.cnt === maxCnt).map((e) => e.emotion) };
      });

    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInsight = async (req, res) => {
  const userId = req.user.id;

  const periods = [
    { days: 3,    label: '3days' },
    { days: 7,    label: '7days' },
    { days: null, label: 'all'   },
  ];

  try {
    for (const { days, label } of periods) {
      const params = [userId];
      let entryDateClause  = '';
      let joinedDateClause = '';

      if (days !== null) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        params.push(from.toISOString().slice(0, 10));
        entryDateClause  = ' AND DATE(created_at) >= $2';
        joinedDateClause = ' AND DATE(e.created_at) >= $2';
      }

      const countRes = await db.query(
        `SELECT COUNT(*) FROM entries WHERE user_id = $1${entryDateClause}`,
        params
      );
      if (parseInt(countRes.rows[0].count) === 0) continue;

      const [emotionRes, tagRes] = await Promise.all([
        db.query(
          `SELECT emotion, COUNT(*) as cnt FROM entries WHERE user_id = $1${entryDateClause}
           GROUP BY emotion ORDER BY cnt DESC LIMIT 1`,
          params
        ),
        db.query(
          `SELECT t.name, COUNT(*) as cnt
           FROM entries e
           JOIN entry_tags et ON et.entry_id = e.id
           JOIN tags t ON t.id = et.tag_id
           WHERE e.user_id = $1${joinedDateClause}
           GROUP BY t.name ORDER BY cnt DESC LIMIT 1`,
          params
        ),
      ]);

      const emotion = emotionRes.rows[0]?.emotion || 'нейтральный';
      const tag     = tagRes.rows[0]?.name || null;
      const { recommendation } = await knowledgeBase.getRecommendation(emotion, tag);

      return res.json({ emotion, tag, recommendation, period: label });
    }

    return res.json({ emotion: null, tag: null, recommendation: null, period: 'none' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
