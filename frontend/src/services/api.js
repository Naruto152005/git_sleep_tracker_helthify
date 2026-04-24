import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let getTokenFunc = null;

export const setTokenProvider = (fn) => {
  getTokenFunc = fn;
}

// Add token to requests
api.interceptors.request.use(async (config) => {
  if (getTokenFunc) {
    const token = await getTokenFunc();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export const sleepAPI = {
  createLog: (data) => api.post('/sleep/log', data),
  getLogs: (userId, days = 30) => api.get(`/sleep/logs/${userId}?days=${days}`),
  getAnalytics: (userId, days = 30) => api.get(`/sleep/analytics/${userId}?days=${days}`),
  clearLogs: (userId) => api.delete(`/sleep/logs/${userId}`),
}

export const productivityAPI = {
  createLog: (data) => api.post('/productivity/log', data),
  getLogs: (userId, days = 30) => api.get(`/productivity/logs/${userId}?days=${days}`),
  getCorrelation: (userId, days = 30) => api.get(`/productivity/correlation/${userId}?days=${days}`),
  clearLogs: (userId) => api.delete(`/productivity/logs/${userId}`),
}

export const coachAPI = {
  getRecommendation: (userId) => api.get(`/coach/recommendation/${userId}`),
  getDietPlan: (userId) => api.get(`/coach/diet/${userId}`),
  chat: (data) => api.post('/coach/chat', data),
  getInsights: (userId) => api.get(`/coach/insights/${userId}`),
  getAllRecommendations: (userId, days = 7) => api.get(`/coach/recommendations/${userId}?days=${days}`),
}

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google-auth', data),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/auth/profile/${userId}`, data),
}

export default api
