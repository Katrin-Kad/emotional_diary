import { useState } from 'react';
import { api } from '../api';

const ACCENT_MAP = {
  нейтральный: { accent: '#6b7280', light: '#f3f4f6', text: '#fff' },
  счастье:     { accent: '#d97706', light: '#fffbeb', text: '#fff' },
  грусть:      { accent: '#3b82f6', light: '#eff6ff', text: '#fff' },
  энтузиазм:   { accent: '#ea580c', light: '#fff7ed', text: '#fff' },
  страх:       { accent: '#7c3aed', light: '#f5f3ff', text: '#fff' },
  гнев:        { accent: '#dc2626', light: '#fef2f2', text: '#fff' },
  отвращение:  { accent: '#65a30d', light: '#f7fee7', text: '#fff' },
};

export function applyTheme(emotion) {
  const theme = ACCENT_MAP[emotion] || ACCENT_MAP['нейтральный'];
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-light', theme.light);
  root.style.setProperty('--accent-text', theme.text);
}

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        await api.register(email, password);
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
    <div className="auth-wrap">
      <h1>Дневник</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Войти</button>
        <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Регистрация</button>
      </div>
      <div className="card">
        <form onSubmit={submit} className="form-group">
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}
