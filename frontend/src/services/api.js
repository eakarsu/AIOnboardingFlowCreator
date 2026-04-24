import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  logout: () => api.post('/auth/logout'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Flows
export const flowsAPI = {
  getAll: (params) => api.get('/flows', { params }),
  getById: (id) => api.get(`/flows/${id}`),
  create: (data) => api.post('/flows', data),
  update: (id, data) => api.put(`/flows/${id}`, data),
  delete: (id) => api.delete(`/flows/${id}`),
  getSteps: (flowId) => api.get(`/flows/${flowId}/steps`),
  getAnalytics: (flowId) => api.get(`/flows/${flowId}/analytics`),
  exportCSV: () => api.get('/flows/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/flows/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/flows/bulk-delete', { ids }),
};

// Steps
export const stepsAPI = {
  getAll: (params) => api.get('/steps', { params }),
  getById: (id) => api.get(`/steps/${id}`),
  create: (data) => api.post('/steps', data),
  update: (id, data) => api.put(`/steps/${id}`, data),
  delete: (id) => api.delete(`/steps/${id}`),
};

// Segments
export const segmentsAPI = {
  getAll: (params) => api.get('/segments', { params }),
  getById: (id) => api.get(`/segments/${id}`),
  create: (data) => api.post('/segments', data),
  update: (id, data) => api.put(`/segments/${id}`, data),
  delete: (id) => api.delete(`/segments/${id}`),
  exportCSV: () => api.get('/segments/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/segments/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/segments/bulk-delete', { ids }),
};

// Templates
export const templatesAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  exportCSV: () => api.get('/templates/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/templates/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/templates/bulk-delete', { ids }),
};

// AI Content
export const aiContentAPI = {
  getAll: (params) => api.get('/ai-content', { params }),
  getById: (id) => api.get(`/ai-content/${id}`),
  create: (data) => api.post('/ai-content', data),
  delete: (id) => api.delete(`/ai-content/${id}`),
  exportCSV: () => api.get('/ai-content/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/ai-content/export/pdf', { responseType: 'blob' }),
};

// Analytics
export const analyticsAPI = {
  getAll: (params) => api.get('/analytics', { params }),
  getById: (id) => api.get(`/analytics/${id}`),
  create: (data) => api.post('/analytics', data),
};

// Integrations
export const integrationsAPI = {
  getAll: (params) => api.get('/integrations', { params }),
  getById: (id) => api.get(`/integrations/${id}`),
  create: (data) => api.post('/integrations', data),
  update: (id, data) => api.put(`/integrations/${id}`, data),
  delete: (id) => api.delete(`/integrations/${id}`),
  exportCSV: () => api.get('/integrations/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/integrations/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/integrations/bulk-delete', { ids }),
};

// Tooltips
export const tooltipsAPI = {
  getAll: (params) => api.get('/tooltips', { params }),
  getById: (id) => api.get(`/tooltips/${id}`),
  create: (data) => api.post('/tooltips', data),
  update: (id, data) => api.put(`/tooltips/${id}`, data),
  delete: (id) => api.delete(`/tooltips/${id}`),
  exportCSV: () => api.get('/tooltips/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/tooltips/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/tooltips/bulk-delete', { ids }),
};

// Checklists
export const checklistsAPI = {
  getAll: (params) => api.get('/checklists', { params }),
  getById: (id) => api.get(`/checklists/${id}`),
  create: (data) => api.post('/checklists', data),
  update: (id, data) => api.put(`/checklists/${id}`, data),
  delete: (id) => api.delete(`/checklists/${id}`),
  exportCSV: () => api.get('/checklists/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/checklists/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/checklists/bulk-delete', { ids }),
};

// Progress
export const progressAPI = {
  getAll: (params) => api.get('/progress', { params }),
  getById: (id) => api.get(`/progress/${id}`),
  getByUser: (userId) => api.get(`/users/${userId}/progress`),
  create: (data) => api.post('/progress', data),
  update: (id, data) => api.put(`/progress/${id}`, data),
};

// A/B Tests
export const abTestsAPI = {
  getAll: (params) => api.get('/ab-tests', { params }),
  getById: (id) => api.get(`/ab-tests/${id}`),
  create: (data) => api.post('/ab-tests', data),
  update: (id, data) => api.put(`/ab-tests/${id}`, data),
  delete: (id) => api.delete(`/ab-tests/${id}`),
  exportCSV: () => api.get('/ab-tests/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/ab-tests/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/ab-tests/bulk-delete', { ids }),
};

// Triggers
export const triggersAPI = {
  getAll: (params) => api.get('/triggers', { params }),
  getById: (id) => api.get(`/triggers/${id}`),
  create: (data) => api.post('/triggers', data),
  update: (id, data) => api.put(`/triggers/${id}`, data),
  delete: (id) => api.delete(`/triggers/${id}`),
  exportCSV: () => api.get('/triggers/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/triggers/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/triggers/bulk-delete', { ids }),
};

// Personalization
export const personalizationAPI = {
  getAll: (params) => api.get('/personalization', { params }),
  getById: (id) => api.get(`/personalization/${id}`),
  create: (data) => api.post('/personalization', data),
  update: (id, data) => api.put(`/personalization/${id}`, data),
  delete: (id) => api.delete(`/personalization/${id}`),
  exportCSV: () => api.get('/personalization/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/personalization/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/personalization/bulk-delete', { ids }),
};

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
  exportCSV: () => api.get('/notifications/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/notifications/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/notifications/bulk-delete', { ids }),
};

// PTO Requests
export const ptoRequestsAPI = {
  getAll: (params) => api.get('/pto-requests', { params }),
  getById: (id) => api.get(`/pto-requests/${id}`),
  create: (data) => api.post('/pto-requests', data),
  update: (id, data) => api.put(`/pto-requests/${id}`, data),
  delete: (id) => api.delete(`/pto-requests/${id}`),
  exportCSV: () => api.get('/pto-requests/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/pto-requests/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/pto-requests/bulk-delete', { ids }),
};

// Mentor Matches
export const mentorMatchesAPI = {
  getAll: (params) => api.get('/mentor-matches', { params }),
  getById: (id) => api.get(`/mentor-matches/${id}`),
  create: (data) => api.post('/mentor-matches', data),
  update: (id, data) => api.put(`/mentor-matches/${id}`, data),
  delete: (id) => api.delete(`/mentor-matches/${id}`),
  exportCSV: () => api.get('/mentor-matches/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/mentor-matches/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/mentor-matches/bulk-delete', { ids }),
};

// Feedback
export const feedbackAPI = {
  getAll: (params) => api.get('/feedback', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  create: (data) => api.post('/feedback', data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
  exportCSV: () => api.get('/feedback/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/feedback/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/feedback/bulk-delete', { ids }),
};

// Training Recommendations
export const trainingAPI = {
  getAll: (params) => api.get('/training-recommendations', { params }),
  getById: (id) => api.get(`/training-recommendations/${id}`),
  create: (data) => api.post('/training-recommendations', data),
  update: (id, data) => api.put(`/training-recommendations/${id}`, data),
  delete: (id) => api.delete(`/training-recommendations/${id}`),
  exportCSV: () => api.get('/training-recommendations/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/training-recommendations/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/training-recommendations/bulk-delete', { ids }),
};

// AI Checklists
export const aiChecklistsAPI = {
  getAll: (params) => api.get('/ai-checklists', { params }),
  getById: (id) => api.get(`/ai-checklists/${id}`),
  create: (data) => api.post('/ai-checklists', data),
  update: (id, data) => api.put(`/ai-checklists/${id}`, data),
  delete: (id) => api.delete(`/ai-checklists/${id}`),
  exportCSV: () => api.get('/ai-checklists/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/ai-checklists/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/ai-checklists/bulk-delete', { ids }),
};

// AI Progress
export const aiProgressAPI = {
  getAll: (params) => api.get('/ai-progress', { params }),
  getById: (id) => api.get(`/ai-progress/${id}`),
  create: (data) => api.post('/ai-progress', data),
  update: (id, data) => api.put(`/ai-progress/${id}`, data),
  delete: (id) => api.delete(`/ai-progress/${id}`),
  exportCSV: () => api.get('/ai-progress/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/ai-progress/export/pdf', { responseType: 'blob' }),
  bulkDelete: (ids) => api.post('/ai-progress/bulk-delete', { ids }),
};

// AI Generation
export const aiGenerateAPI = {
  welcomeMessage: (data) => api.post('/ai/generate/welcome', data),
  flowSteps: (data) => api.post('/ai/generate/steps', data),
  tooltipContent: (data) => api.post('/ai/generate/tooltip', data),
  checklistItems: (data) => api.post('/ai/generate/checklist', data),
  notificationCopy: (data) => api.post('/ai/generate/notification', data),
  emailSequence: (data) => api.post('/ai/generate/email-sequence', data),
  improveContent: (data) => api.post('/ai/improve', data),
  abVariant: (data) => api.post('/ai/generate/ab-variant', data),
  analyzeFlow: (flowId) => api.get(`/ai/analyze/flow/${flowId}`),
  analyzePTO: (data) => api.post('/ai/analyze/pto', data),
  findMentor: (data) => api.post('/ai/find-mentor', data),
  analyzeFeedback: (data) => api.post('/ai/analyze/feedback', data),
  generateTrainingPlan: (data) => api.post('/ai/generate/training-plan', data),
  generateAIChecklist: (data) => api.post('/ai/generate/ai-checklist', data),
  analyzeProgress: (data) => api.post('/ai/analyze/progress', data),
};

export default api;
