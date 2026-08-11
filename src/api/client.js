import axios from 'axios';

// In production, VITE_API_URL must be set to your Django backend URL.
// In local dev, falls back to the Vite proxy at /api
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Response interceptor — normalize errors
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data || {};
    const status = error.response?.status;
    const errorMsg =
      data.detail ||
      data.error ||
      (typeof data === 'object' ? Object.values(data)[0] : 'Request failed');
    const err = new Error(
      typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
    );
    err.data = data;
    err.status = status;
    console.error(
      `API Error on [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`,
      err
    );
    return Promise.reject(err);
  }
);

export const api = {
  // Participant
  lookupParticipant: (phone) =>
    client.get(`/auth/lookup/?phone=${encodeURIComponent(phone)}`),

  getParticipantHistory: (phoneOrId) => {
    const isId =
      typeof phoneOrId === 'number' ||
      (/^\d+$/.test(phoneOrId) && String(phoneOrId).length < 8);
    const param = isId
      ? `participant_id=${phoneOrId}`
      : `phone=${encodeURIComponent(phoneOrId)}`;
    return client.get(`/participant/history/?${param}`);
  },

  authParticipant: (name, phone_number, photo = '') =>
    client.post('/auth/participant/', { name, phone_number, photo }),

  getTodayQuiz: (participantId) =>
    client.get(`/quiz/today/${participantId ? `?participant_id=${participantId}` : ''}`),

  submitQuizAttempt: (quizId, participantId, answers) =>
    client.post(`/quiz/${quizId}/submit/`, { participant_id: participantId, answers }),

  // Admin
  getAdminStats: () => client.get('/admin/stats/'),
  getAdminQuizzes: () => client.get('/admin/quizzes/'),
  getAdminQuizDetail: (id) => client.get(`/admin/quizzes/${id}/`),

  createAdminQuiz: (quizData) => client.post('/admin/quizzes/', quizData),
  updateAdminQuiz: (id, quizData) => client.put(`/admin/quizzes/${id}/`, quizData),
  deleteAdminQuiz: (id) => client.delete(`/admin/quizzes/${id}/`),
  publishAdminQuiz: (id) => client.post(`/admin/quizzes/${id}/publish/`),
  makeLiveAdminQuiz: (id) => client.post(`/admin/quizzes/${id}/make_live/`),
  closeAdminQuiz: (id) => client.post(`/admin/quizzes/${id}/close_quiz/`),

  getAdminParticipants: (quizId) =>
    client.get(`/admin/participants/${quizId ? `?quiz_id=${quizId}` : ''}`),
  getAdminCumulativeParticipants: () =>
    client.get('/admin/participants/cumulative/'),
  getAdminAttemptDetail: (attemptId) =>
    client.get(`/admin/attempts/${attemptId}/`),
  getAdminQuizWinner: (quizId) =>
    client.get(`/admin/quizzes/${quizId}/winner/`),
  getAdminQuizResults: (quizId) =>
    client.get(`/admin/quizzes/${quizId}/results/`),
};
