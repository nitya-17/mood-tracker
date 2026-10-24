const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('mood_tracker_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('mood_tracker_token', token);
  } else {
    localStorage.removeItem('mood_tracker_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Expired or invalid token
    setToken(null);
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || response.statusText || 'Request failed';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data?.details;
    error.code = data?.code;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateMe: (profile) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(profile) }),
  getReminders: () => request('/auth/reminders'),
  updateReminders: (reminders) => request('/auth/reminders', { method: 'PUT', body: JSON.stringify(reminders) }),

  // Feelings & Quotes
  getFeelings: () => request('/feelings'),
  getQuote: (mood) => request(`/quotes${mood ? `?mood=${mood}` : ''}`),

  // Entries
  getTodayEntry: () => request('/entries/today'),
  createEntry: (entry) => request('/entries', { method: 'POST', body: JSON.stringify(entry) }),
  getRecentEntries: (limit = 11) => request(`/entries?limit=${limit}`),
  getRangeEntries: ({ from, to, granularity = 'daily', includeGaps = false }) =>
    request(`/entries?from=${from}&to=${to}&granularity=${granularity}&include_gaps=${includeGaps}`),

  // Analytics
  getComparison: () => request('/analytics/compare'),
  getRolling: () => request('/analytics/rolling'),
  getStreaks: () => request('/analytics/streaks'),
  getPatterns: () => request('/analytics/patterns'),
  getCorrelation: () => request('/analytics/correlation'),

  // Export
  getExportUrl: (format = 'csv') => {
    const token = getToken();
    return `${API_BASE}/export?format=${format}&token=${token}`;
  },
  downloadExport: async (format = 'csv') => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood_entries_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
