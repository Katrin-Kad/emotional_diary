import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { VARIANT } from './variant.js';

document.body.dataset.variant = VARIANT;
console.log(`%c Affecta: вариант ${VARIANT.toUpperCase()} ${ VARIANT === 'a' ? '(эмоциональный UI)' : '(нейтральный UI)' }`, 'background:#4E87F2;color:#fff;padding:4px 10px;border-radius:6px;font-weight:bold');

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
