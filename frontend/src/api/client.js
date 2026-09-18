// client.js — wrapper central para chamadas à API do EducaMais+
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('educamais_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // resposta sem corpo
  }

  if (!res.ok) {
    const message = (data && data.error) || `Erro na requisição (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (payload) => request('/profile', { method: 'PUT', body: payload }),

  // Resources
  listResources: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    const query = qs.toString();
    return request(`/resources${query ? `?${query}` : ''}`);
  },
  getResource: (id) => request(`/resources/${id}`),
  createResource: (payload) => request('/resources', { method: 'POST', body: payload }),
  deleteResource: (id) => request(`/resources/${id}`, { method: 'DELETE' }),
  listSubjects: () => request('/resources/subjects'),

  // Favorites / history
  listFavorites: () => request('/favorites'),
  addFavorite: (resourceId) => request(`/favorites/${resourceId}`, { method: 'POST' }),
  removeFavorite: (resourceId) => request(`/favorites/${resourceId}`, { method: 'DELETE' }),
  listHistory: () => request('/favorites/history/list'),

  // Forum
  listChannels: () => request('/forum/channels'),
  createChannel: (name) => request('/forum/channels', { method: 'POST', body: { name } }),
  listMessages: (channelId) => request(`/forum/channels/${channelId}/messages`),
  sendMessage: (channelId, content) =>
    request(`/forum/channels/${channelId}/messages`, { method: 'POST', body: { content } }),

  // Notifications
  listNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Evaluations
  listStudents: () => request('/evaluations/students'),
  createEvaluation: (payload) => request('/evaluations', { method: 'POST', body: payload }),
  getStudentEvaluations: (studentId) => request(`/evaluations/student/${studentId}`),
};

export { getToken };
