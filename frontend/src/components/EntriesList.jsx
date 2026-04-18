import { useState, useEffect } from 'react';
import { api } from '../api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EntriesList() {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (page) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getEntries(page, 10);
      setEntries(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) return <div className="spinner">Загрузка...</div>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      {entries.length === 0 ? (
        <p className="empty">Записей пока нет. Напиши первую!</p>
      ) : (
        <div className="card">
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <div className="entry-header">
                <span className="emotion-badge" style={{ fontSize: '0.78rem', padding: '3px 10px' }}>{entry.emotion}</span>
                <span className="entry-date">{formatDate(entry.createdAt)}</span>
              </div>
              <p className="entry-text">{entry.text}</p>
              {entry.tags?.length > 0 && (
                <div className="entry-meta">
                  {entry.tags.map(t => <span key={t} className="tag-label">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn ${p === pagination.page ? 'active' : ''}`}
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
