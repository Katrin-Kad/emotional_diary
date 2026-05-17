import { useState, useEffect, useRef } from 'react';
import { isEmotionalUI } from '../../variant.js';
import { api } from '../../api.js';
import Mascot from '../Mascot/Mascot.jsx';
import styles from './Stats.module.css';

const EMOTIONS = ['счастье', 'грусть', 'гнев', 'энтузиазм', 'страх', 'нейтральный', 'отвращение'];
const TAG_FILTERS = ['Все', 'Учёба', 'Работа', 'Семья', 'Отношения', 'Здоровье', 'Друзья', 'Отдых', 'Другое'];
const TRENDS_PER_PAGE = 5;

const monthAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

const periodLabel = (period) =>
  period === '3days' ? 'Последние 3 дня' :
  period === '7days' ? 'Последнюю неделю' :
  'За всё время';

const TAG_ACC = {
  'учёба':     'учёбу',
  'работа':    'работу',
  'отношения': 'отношения',
  'здоровье':  'здоровье',
  'друзья':    'друзей',
  'семья':     'семью',
  'отдых':     'отдых',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

export default function Stats() {
  const [summary, setSummary]           = useState(null);
  const [insight, setInsight]           = useState(null);
  const [emotionStats, setEmotionStats] = useState(null);
  const [tagStats, setTagStats]         = useState(null);
  const [trends, setTrends]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTag, setActiveTag]       = useState('Все');
  const [trendPage, setTrendPage]       = useState(0);
  const [emotionTrigger, setEmotionTrigger] = useState(null);
  const isFirstTagRender = useRef(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getStatsSummary(),
      api.getInsight(),
      api.getEmotionStats(),
      api.getTagStats(),
      api.getTrends(monthAgo(), today()),
    ])
      .then(([sum, ins, em, tg, tr]) => {
        setSummary(sum);
        setInsight(ins);
        setEmotionStats(em);
        setTagStats(tg);
        setTrends(tr);
        if (ins?.emotion && isEmotionalUI) {
          setEmotionTrigger({ emotion: ins.emotion, id: Date.now() });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isFirstTagRender.current) { isFirstTagRender.current = false; return; }
    const tag = activeTag === 'Все' ? null : activeTag === 'Другое' ? 'другое' : activeTag.toLowerCase();
    api.getEmotionStats(null, tag).then(setEmotionStats).catch(() => {});
    setTrendPage(0);
  }, [activeTag]);

  if (loading) return <div className="spinner">Загрузка...</div>;

  const maxEmotion = emotionStats ? Math.max(1, ...Object.values(emotionStats)) : 1;
  const tagEntries = tagStats ? Object.entries(tagStats).sort(([, a], [, b]) => b - a) : [];
  const maxTag     = tagEntries.length ? Math.max(1, ...tagEntries.map(([, v]) => v)) : 1;

  const trendPages   = Math.ceil(trends.length / TRENDS_PER_PAGE);
  const visibleTrends = trends.slice(trendPage * TRENDS_PER_PAGE, (trendPage + 1) * TRENDS_PER_PAGE);

  const renderInsight = () => {
    if (!insight || insight.period === 'none') {
      return <span>Пока записей маловато — но я уже жду твоих мыслей</span>;
    }
    const { tag, emotion, recommendation, period } = insight;
    const label = periodLabel(period);
    if (tag) {
      return (
        <>
          {label} ты чаще писал про <strong>{TAG_ACC[tag] ?? tag}</strong> — и в совновном это была{' '}
          <strong className={`color-${emotion}`}>{emotion}</strong>. {recommendation}
        </>
      );
    }
    return (
      <>
        {label} чаще всего это была{' '}
        <strong className={`color-${emotion}`}>{emotion}</strong>. {recommendation}
      </>
    );
  };

  return (
    <div className={styles.analyticsPage}>

      {/* Mascot insight */}
      <div className={styles.insightRow}>
        <div className={styles.insightMascot}>
          <Mascot emotionTrigger={emotionTrigger} />
        </div>
        <div className={styles.insightBubble}>
          <p className={styles.insightText}>{renderInsight()}</p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <div className={styles.num}>{summary.totalEntries}</div>
            <div className={styles.lbl}>записей всего</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.num}>{summary.activeDays}</div>
            <div className={styles.lbl}>активных дней</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.num}>{summary.streak}</div>
            <div className={styles.lbl}>дня подряд</div>
          </div>
        </div>
      )}

      {/* Emotions with tag filter */}
      <div className={`${styles.sectionCard} ${styles.emotionsCard}`}>
        <div className={styles.sectionCardTitle}>Эмоции за все время</div>
        <div className={styles.tagFilterRow}>
          {TAG_FILTERS.map(t => (
            <button
              key={t}
              className={`${styles.filterChip} ${activeTag === t ? styles.filterChipActive : ''}`}
              onClick={() => setActiveTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {emotionStats && EMOTIONS.map(em => (
          <div key={em} className={styles.statRow}>
            <span className={styles.statLabel}>{em}</span>
            <div className={styles.statBarWrap}>
              <div
                className={`${styles.statBar} bar-${em}`}
                style={{ width: `${((emotionStats[em] || 0) / maxEmotion) * 100}%` }}
              />
            </div>
            <span className={styles.statCount}>{emotionStats[em] || 0}</span>
          </div>
        ))}
      </div>

      {/* Bottom grid: trend + tags */}
      <div className={styles.analyticsGrid}>
        <div className={styles.sectionCard}>
          <div className={styles.trendHeader}>
            <span className={styles.sectionCardTitle}>Тренд эмоций</span>
            {trendPages > 1 && (
              <div className={styles.trendPagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setTrendPage(p => Math.max(0, p - 1))}
                  disabled={trendPage === 0}
                >‹</button>
                <button
                  className={styles.pageBtn}
                  onClick={() => setTrendPage(p => Math.min(trendPages - 1, p + 1))}
                  disabled={trendPage >= trendPages - 1}
                >›</button>
              </div>
            )}
          </div>
          {visibleTrends.length === 0 ? (
            <p className="empty" style={{ padding: '8px 0' }}>Нет данных за период</p>
          ) : (
            <div className={styles.trendList}>
              {visibleTrends.map((t, i) => (
                <div key={i} className={styles.trendItem}>
                  <span className={styles.trendDate}>{formatDate(t.date)}</span>
                  <div className={styles.trendEmotions}>
                    {t.emotions.map(em => (
                      <span key={em} className={`${styles.trendEmotionText} color-${em}`}>{em}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionCardTitle}>Популярные теги</div>
          {tagEntries.map(([tag, count]) => (
            <div key={tag} className={styles.statRow}>
              <span className={styles.statLabel}>{tag}</span>
              <div className={styles.statBarWrap}>
                <div className={`${styles.statBar} bar-tag`} style={{ width: `${(count / maxTag) * 100}%` }} />
              </div>
              <span className={styles.statCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
