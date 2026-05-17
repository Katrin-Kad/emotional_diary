import { useState } from 'react';
import { api } from '../../api.js';
import styles from './Auth.module.css';
import { isEmotionalUI } from '../../variant.js';

const ACCENT_MAP = {
  нейтральный: '#4E87F2',
  счастье:     '#FEDC54',
  грусть:      '#2CB6FE',
  энтузиазм:   '#FFA85C',
  страх:       '#AD87E3',
  гнев:        '#F49191',
  отвращение:  '#7CC87C',
};

const ACCENT_LIGHT = {
  нейтральный: '#E8F0FE',
  счастье:     '#FFFDE7',
  грусть:      '#E3F7FF',
  энтузиазм:   '#FFF3E6',
  страх:       '#F3EDFC',
  гнев:        '#FEF0F0',
  отвращение:  '#EFFAF0',
};

let themeTimer = null;

export function applyTheme(emotion) {
  if (!isEmotionalUI) return;
  const root = document.documentElement;
  root.style.setProperty('--accent', ACCENT_MAP[emotion] || '#4E87F2');
  root.style.setProperty('--accent-light', ACCENT_LIGHT[emotion] || '#E8F0FE');
  root.style.setProperty('--bg', ACCENT_LIGHT[emotion] || '#fff');

  if (themeTimer) clearTimeout(themeTimer);
  themeTimer = setTimeout(() => {
    root.style.setProperty('--accent', '#4E87F2');
    root.style.setProperty('--accent-light', '#E8F0FE');
    root.style.setProperty('--bg', '#fff');
  }, 6000);
}

const GENDERS = ['', 'Мужской', 'Женский', 'Другой'];

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await api.login(email, password);
      } else {
        await api.register(email, password, name, gender);
        await api.login(email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLogo}>Affecta</div>

      <div className={styles.authCard}>
        <div className={styles.authCardTitle}>
          {tab === 'login' ? 'Приятно снова встретиться!' : 'Давай знакомиться!'}
        </div>

        <form onSubmit={submit} className={styles.formGroup}>
          {tab === 'register' && (
            <div className={styles.formRow}>
              <div>
                <label>Имя</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" />
              </div>
              <div>
                <label>Пол</label>
                <select value={gender} onChange={e => setGender(e.target.value)}>
                  {GENDERS.map(g => <option key={g} value={g}>{g || 'Не указан'}</option>)}
                </select>
              </div>
            </div>
          )}

          <div>
            <label>Почта</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com" required autoFocus />
          </div>

          <div>
            <label>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 6 символов" required minLength={6} />
          </div>

          {error && <p className="error">{error}</p>}

          {tab === 'login' && (
            <div className={styles.authLinksRow}>
              <button type="button" className={styles.authLink} onClick={() => {}}>
                Напомнить пароль?
              </button>
            </div>
          )}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <div style={{ textAlign: 'center' }}>
            {tab === 'login' ? (
              <button type="button" className={styles.authLink} onClick={() => setTab('register')}>
                Ещё не знакомы?
              </button>
            ) : (
              <button type="button" className={styles.authLink} onClick={() => setTab('login')}>
                Уже есть аккаунт? Войти
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
