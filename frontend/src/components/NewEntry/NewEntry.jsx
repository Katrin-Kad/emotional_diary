import { useState, useEffect, useRef } from 'react';
import { api } from '../../api.js';
import { applyTheme } from '../Auth/Auth.jsx';
import { ym } from '../../ym.js';
import { isEmotionalUI } from '../../variant.js';
import Mascot from '../Mascot/Mascot.jsx';
import EntriesList from '../EntriesList/EntriesList.jsx';
import EntryDetail from '../EntryDetail/EntryDetail.jsx';
import styles from './NewEntry.module.css';

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_PLACEHOLDER = 'Что произошло сегодня? Опишите ситуацию и мысли...';

export default function NewEntry() {
  const [text, setText] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emotionTrigger, setEmotionTrigger] = useState(null);
  const [date, setDate] = useState(today());
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const dateInputRef = useRef(null);

  useEffect(() => {
    api.getTags().then(setAllTags).catch(() => {});
    if (isEmotionalUI) {
      const lastEmotion = localStorage.getItem('lastEmotion');
      if (lastEmotion) {
        api.getUiReaction(lastEmotion)
          .then(r => { if (r.placeholder) setPlaceholder(r.placeholder); })
          .catch(() => {});
      }
    }
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await api.createEntry(text.trim(), selectedTags);
      setResult(data);
      if (isEmotionalUI) {
        applyTheme(data.emotion);
        setEmotionTrigger({ emotion: data.emotion, id: Date.now() });
      }
      ym('reachGoal', 'entry_submitted', { emotion: data.emotion, tags: selectedTags });
      localStorage.setItem('lastEmotion', data.emotion);
      if (isEmotionalUI) {
        api.getUiReaction(data.emotion)
          .then(r => { if (r.placeholder) setPlaceholder(r.placeholder); })
          .catch(() => {});
      }
      setText('');
      setSelectedTags([]);
      setDate(today());
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (selectedEntry) {
    return <EntryDetail entry={selectedEntry} onBack={() => setSelectedEntry(null)} />;
  }

  return (
    <>
      <div className={styles.diaryTop}>
        <div className={styles.mascotCol}>
          <Mascot emotionTrigger={emotionTrigger} />
        </div>

        <div className={styles.entryCol}>
          <div className="card">
            <div className={styles.sectionTitle}>Новая запись</div>
            <form onSubmit={submit} className={styles.formGroup} style={{ gap: 10 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={placeholder}
                required
                style={{ minHeight: 80 }}
              />
              <div className={styles.tagsRow}>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.tagChip} ${selectedTags.includes(tag) ? styles.tagChipSelected : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {error && <p className="error">{error}</p>}
              <button className="btn btn-primary btn-center" type="submit" disabled={loading || !text.trim()}>
                {loading ? 'Анализирую...' : 'Добавить'}
              </button>
            </form>

            {result && (
              <div
                className={`entry-emotion-band band-${result.emotion}`}
                style={{ margin: '14px -24px -20px', borderRadius: '0 0 14px 14px' }}
              >
                <span className={`emotion-badge badge-${result.emotion}`}>{result.emotion}</span>
                <span className="entry-recommendation">{result.recommendation}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.entriesHeader}>
        <div className={styles.entriesTitle}>Ваши записи</div>
        <div className={styles.datePickerRow}>
          <span>за</span>
          <input ref={dateInputRef} type="date" value={date} onChange={e => setDate(e.target.value)} />
          <span style={{ cursor: 'pointer' }} onClick={() => dateInputRef.current?.showPicker()}>▾</span>
        </div>
      </div>

      <EntriesList date={date} refreshKey={refreshKey} onSelect={setSelectedEntry} />
    </>
  );
}
