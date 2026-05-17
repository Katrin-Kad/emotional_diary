import { useState, useEffect } from 'react';
import { api } from '../../api';
import styles from './EntriesList.module.css';

export default function EntriesList({ date, refreshKey, onSelect }) {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (page) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getEntries(page, 10, date);
      setEntries(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [date, refreshKey]);

  const handleDelete = async (id) => {
    try {
      await api.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) return <div className="spinner">Загрузка...</div>;
  if (error) return <p className="error">{error}</p>;

  if (entries.length === 0) {
    return <p className="empty">Записей за этот день нет. Напиши первую!</p>;
  }

  return (
    <div>
      {entries.map(entry => (
        <div key={entry.id} className={styles.entryCard} onClick={() => onSelect?.(entry)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
          <div className={styles.entryCardHeader}>
            <div className={styles.entryTagsLine}>
              <span>Теги:</span>
              {entry.tags?.length
                ? entry.tags.map(t => (
                    <span key={t} className={styles.entryTagChip}>{t}</span>
                  ))
                : <span>—</span>
              }
            </div>
            <div className={styles.entryActions}>
              <button
                className={styles.btnIconDelete}
                title="Удалить"
                onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
              >
                <img src="/assets/delete.svg" alt="Удалить" />
              </button>
            </div>
          </div>

          <div className={styles.entrySituation}>
            <span className={styles.sitLabel}>Ситуация: </span>{entry.text}
          </div>

          <div className={`entry-emotion-band band-${entry.emotion}`}>
            <span className={`emotion-badge badge-${entry.emotion}`}>{entry.emotion}</span>
            {entry.recommendation && (
              <span className="entry-recommendation">{entry.recommendation}</span>
            )}
            {entry.score != null && (
              <span className="entry-score">{Math.round(entry.score * 100)}%</span>
            )}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === pagination.page ? styles.pageBtnActive : ''}`}
              onClick={() => load(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
