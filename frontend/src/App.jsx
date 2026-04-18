import { useState, useEffect } from 'react';
import { api } from './api';
import Auth, { applyTheme } from './components/Auth';
import NewEntry from './components/NewEntry';
import EntriesList from './components/EntriesList';
import Stats from './components/Stats';

const TABS = [
  { id: 'new', label: 'Запись' },
  { id: 'entries', label: 'Дневник' },
  { id: 'stats', label: 'Статистика' },
];

export default function App() {
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('new');

  useEffect(() => {
    api.getEntries(1, 1)
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  const logout = async () => {
    await api.logout().catch(() => {});
    applyTheme('нейтральный');
    setAuthed(false);
  };

  if (authed === null) return <div className="spinner" style={{ paddingTop: 80 }}>Загрузка...</div>;

  if (!authed) return <Auth onLogin={() => setAuthed(true)} />;

  return (
    <div className="app">
      <header>
        <h1>Дневник</h1>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Выйти</button>
      </header>

      <nav className="nav-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`nav-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'new' && <NewEntry />}
      {tab === 'entries' && <EntriesList />}
      {tab === 'stats' && <Stats />}
    </div>
  );
}
