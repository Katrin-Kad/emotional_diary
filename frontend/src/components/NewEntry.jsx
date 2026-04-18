import { useState, useEffect } from 'react';
import { api } from '../api';
import { applyTheme } from './Auth';

export default function NewEntry() {
  const [text, setText] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTags().then(setAllTags).catch(() => {});
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await api.createEntry(text.trim(), selectedTags);
      const uiData = await api.getUiReaction(data.emotion).catch(() => null);
      setResult({ ...data, ui: uiData });
      applyTheme(data.emotion);
      setText('');
      setSelectedTags([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <form onSubmit={submit} className="form-group">
          <div>
            <label>Как ты себя чувствуешь?</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Напиши о своём дне..."
              required
            />
          </div>
          <div>
            <label>Теги</label>
            <div className="tags-row">
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading || !text.trim()}>
            {loading ? 'Анализирую...' : 'Записать'}
          </button>
        </form>
      </div>

      {result && (
        <div className="result-card">
          <div>
            <span className="emotion-badge">{result.emotion}</span>
            <span className="score">уверенность {Math.round(result.score * 100)}%</span>
          </div>
          <p className="recommendation">{result.recommendation}</p>
          {result.ui && (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 8 }}>
              анимация: {result.ui.animation} · стиль: {result.ui.uiStyle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
