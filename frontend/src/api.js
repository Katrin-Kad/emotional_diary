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
  register: (email, password) => req('POST', '/auth/register', { email, password }),
  login: (email, password) => req('POST', '/auth/login', { email, password }),
  logout: () => req('POST', '/auth/logout'),

  getEntries: (page = 1, limit = 10) => req('GET', `/entries?page=${page}&limit=${limit}`),
  getEntry: (id) => req('GET', `/entries/${id}`),
  createEntry: (text, tags) => req('POST', '/entries', { text, tags }),

  getTags: () => req('GET', '/tags'),

  analyzeEmotion: (text) => req('POST', '/analyze-emotion', { text }),
  getRecommendation: (emotion, tags) => req('GET', `/recommendation?emotion=${encodeURIComponent(emotion)}&tags=${tags.map(encodeURIComponent).join('&tags=')}`),
  getUiReaction: (emotion) => req('GET', `/ui-reaction?emotion=${encodeURIComponent(emotion)}`),

  getEmotionStats: (date) => req('GET', `/stats/emotions${date ? `?date=${date}` : ''}`),
  getTagStats: (date) => req('GET', `/stats/tags${date ? `?date=${date}` : ''}`),
  getTrends: (from, to) => req('GET', `/stats/trends?from=${from}&to=${to}`),
};
