import { useState, useEffect } from 'react';
import { api } from './api';
import Auth, { applyTheme } from './components/Auth/Auth';
import NewEntry from './components/NewEntry/NewEntry';
import Stats from './components/Stats/Stats';
import styles from './App.module.css';
import { ym } from './ym';

export default function App() {
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('diary');

  useEffect(() => {
    api.getEntries(1, 1)
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    ym('hit', '/diary');
  }, [authed]);

  const logout = async () => {
    await api.logout().catch(() => {});
    applyTheme('нейтральный');
    setAuthed(false);
  };

  if (authed === null) return <div className="spinner" style={{ paddingTop: 120 }}>Загрузка...</div>;
  if (!authed) return <Auth onLogin={() => setAuthed(true)} />;

  return (
    <div>
      <header className={styles.appHeader}>
        <div className={styles.appHeaderInner}>
          <span className={styles.appLogo}>Affecta</span>
          <nav className={styles.navTabs}>
            <button
              className={`${styles.navTab} ${tab === 'diary' ? styles.active : ''}`}
              onClick={() => { setTab('diary'); ym('hit', '/diary'); }}
            >
              Дневник эмоций
            </button>
            <button
              className={`${styles.navTab} ${tab === 'stats' ? styles.active : ''}`}
              onClick={() => { setTab('stats'); ym('hit', '/analytics'); }}
            >
              Аналитика
            </button>
          </nav>
          <div className={styles.headerRight}>
            <button className="btn btn-ghost" onClick={logout}>Выйти</button>
          </div>
        </div>
      </header>

      <main className={styles.app}>
        {tab === 'diary' && <NewEntry />}
        {tab === 'stats' && <Stats />}
      </main>

      <footer className={styles.appFooter}>
        <div className={styles.footerLeft}>
          <span>©2026 Affecta</span>
          <a href="#">О нас</a>
          <a href="#">Контакты</a>
        </div>
        <div className={styles.footerSocial}>
          <a href="#" className={styles.socialIcon} title="ВКонтакте">
            <img src="/assets/vk.svg" alt="ВКонтакте" />
          </a>
          <a href="#" className={styles.socialIcon} title="Telegram">
            <img src="/assets/telegram.svg" alt="Telegram" />
          </a>
          <a href="#" className={styles.socialIcon} title="Twitter">
            <img src="/assets/twitter.svg" alt="Twitter" />
          </a>
        </div>
      </footer>
    </div>
  );
}
