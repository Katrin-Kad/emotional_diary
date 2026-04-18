import { useState, useEffect } from 'react';
import { api } from '../api';

const EMOTIONS = ['нейтральный', 'счастье', 'грусть', 'энтузиазм', 'страх', 'гнев', 'отвращение'];

const today = () => new Date().toISOString().slice(0, 10);
const weekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
};

export default function Stats() {
  const [date, setDate] = useState(today());
  const [emotionStats, setEmotionStats] = useState(null);
  const [tagStats, setTagStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [from, setFrom] = useState(weekAgo());
  const [to, setTo] = useState(today());
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [em, tg] = await Promise.all([
        api.getEmotionStats(date),
        api.getTagStats(date),
      ]);
      setEmotionStats(em);
      setTagStats(tg);
    } catch {
      setEmotionStats(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTrends = async () => {
    try {
      const data = await api.getTrends(from, to);
      setTrends(data);
    } catch {
      setTrends([]);
    }
  };

  useEffect(() => { loadStats(); }, [date]);
  useEffect(() => { loadTrends(); }, [from, to]);

  const maxEmotion = emotionStats ? Math.max(1, ...Object.values(emotionStats)) : 1;
  const tagEntries = tagStats ? Object.entries(tagStats).filter(([, v]) => v > 0) : [];

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>Эмоции за день</h3>
        <div className="date-row">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        {loading ? (
          <div className="spinner">Загрузка...</div>
        ) : emotionStats ? (
          EMOTIONS.map(em => (
            <div key={em} className="stat-row">
              <span className="stat-label">{em}</span>
              <div className="stat-bar-wrap">
                <div className="stat-bar" style={{ width: `${(emotionStats[em] / maxEmotion) * 100}%` }} />
              </div>
              <span className="stat-count">{emotionStats[em]}</span>
            </div>
          ))
        ) : null}
      </div>

      {tagEntries.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>Теги за день</h3>
          {tagEntries.map(([tag, count]) => (
            <div key={tag} className="stat-row">
              <span className="stat-label">{tag}</span>
              <div className="stat-bar-wrap">
                <div className="stat-bar" style={{ width: `${(count / Math.max(...tagEntries.map(([,v])=>v))) * 100}%` }} />
              </div>
              <span className="stat-count">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>Тренды</h3>
        <div className="date-row">
          <label style={{ fontSize: '0.8rem' }}>С</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <label style={{ fontSize: '0.8rem' }}>По</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        {trends.length === 0 ? (
          <p className="empty" style={{ padding: '16px 0' }}>Нет данных за период</p>
        ) : (
          <div className="trend-list">
            {trends.map((t, i) => (
              <div key={i} className="trend-item">
                <span>{new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                <span className="emotion-badge" style={{ fontSize: '0.78rem', padding: '2px 10px' }}>{t.emotion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
