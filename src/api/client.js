// In production (Netlify), VITE_API_URL must be set to your Django backend URL

// In local dev, falls back to the Vite proxy at /api
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.detail || data.error || (typeof data === 'object' ? Object.values(data)[0] : 'Request failed');
      const err = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      err.data = data;
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Participant
  lookupParticipant: (phone) => request(`/auth/lookup/?phone=${encodeURIComponent(phone)}`),
  getParticipantHistory: (phoneOrId) => {
    const isId = typeof phoneOrId === 'number' || (/^\d+$/.test(phoneOrId) && String(phoneOrId).length < 8);
    const param = isId ? `participant_id=${phoneOrId}` : `phone=${encodeURIComponent(phoneOrId)}`;
    return request(`/participant/history/?${param}`);
  },
  authParticipant: (name, phone_number, photo = '') => request('/auth/participant/', {
    method: 'POST',
    body: JSON.stringify({ name, phone_number, photo }),
  }),
  getTodayQuiz: (participantId) => request(`/quiz/today/${participantId ? `?participant_id=${participantId}` : ''}`),
  submitQuizAttempt: (quizId, participantId, answers) => request(`/quiz/${quizId}/submit/`, {
    method: 'POST',
    body: JSON.stringify({ participant_id: participantId, answers }),
  }),

  // Admin
  getAdminStats: () => request('/admin/stats/'),
  getAdminQuizzes: () => request('/admin/quizzes/'),
  getAdminQuizDetail: (id) => request(`/admin/quizzes/${id}/`),
  createAdminQuiz: (quizData) => request('/admin/quizzes/', {
    method: 'POST',
    body: JSON.stringify(quizData),
  }),
  updateAdminQuiz: (id, quizData) => request(`/admin/quizzes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(quizData),
  }),
  deleteAdminQuiz: (id) => request(`/admin/quizzes/${id}/`, {
    method: 'DELETE',
  }),
  publishAdminQuiz: (id) => request(`/admin/quizzes/${id}/publish/`, { method: 'POST' }),
  makeLiveAdminQuiz: (id) => request(`/admin/quizzes/${id}/make_live/`, { method: 'POST' }),
  closeAdminQuiz: (id) => request(`/admin/quizzes/${id}/close_quiz/`, { method: 'POST' }),

  getAdminParticipants: (quizId) => request(`/admin/participants/${quizId ? `?quiz_id=${quizId}` : ''}`),
  getAdminCumulativeParticipants: () => request('/admin/participants/cumulative/'),
  getAdminAttemptDetail: (attemptId) => request(`/admin/attempts/${attemptId}/`),
  getAdminQuizWinner: (quizId) => request(`/admin/quizzes/${quizId}/winner/`),
  getAdminQuizResults: (quizId) => request(`/admin/quizzes/${quizId}/results/`),
};
