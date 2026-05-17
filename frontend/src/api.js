const req = async (method, url, body) => {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
};

export const api = {
  register: (email, password, name, gender) => req('POST', '/auth/register', { email, password, name, gender }),
  login: (email, password) => req('POST', '/auth/login', { email, password }),
  logout: () => req('POST', '/auth/logout'),

  getEntries: (page = 1, limit = 10, date) =>
    req('GET', `/entries?page=${page}&limit=${limit}${date ? `&date=${date}` : ''}`),
  getEntry: (id) => req('GET', `/entries/${id}`),
  createEntry: (text, tags) => req('POST', '/entries', { text, tags }),
  deleteEntry: (id) => req('DELETE', `/entries/${id}`),

  getTags: () => req('GET', '/tags'),

  analyzeEmotion: (text) => req('POST', '/analyze-emotion', { text }),
  getRecommendation: (emotion, tags) =>
    req('GET', `/recommendation?emotion=${encodeURIComponent(emotion)}&tags=${tags.map(encodeURIComponent).join('&tags=')}`),
  getUiReaction: (emotion) => req('GET', `/ui-reaction?emotion=${encodeURIComponent(emotion)}`),

  getStatsSummary: () => req('GET', '/stats/summary'),
  getInsight: () => req('GET', '/stats/insight'),
  getEmotionStats: (date, tag) => {
    const p = [];
    if (date) p.push(`date=${date}`);
    if (tag)  p.push(`tag=${encodeURIComponent(tag)}`);
    return req('GET', `/stats/emotions${p.length ? '?' + p.join('&') : ''}`);
  },
  getTagStats: (date) => req('GET', `/stats/tags${date ? `?date=${date}` : ''}`),
  getTrends: (from, to) => req('GET', `/stats/trends${from || to ? `?from=${from || ''}&to=${to || ''}` : ''}`),

  getStrategies: (emotion, tag) => {
    const p = [`emotion=${encodeURIComponent(emotion)}`];
    if (tag) p.push(`tag=${encodeURIComponent(tag)}`);
    return req('GET', `/strategies?${p.join('&')}`);
  },
};
