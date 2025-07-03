import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token and handle content type
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set Content-Type to application/json if it's not FormData
    // For FormData, let the browser set the Content-Type automatically
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
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

export const api = {
  // Auth endpoints
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
  
  // Subject endpoints
  getSubjects: () => apiClient.get('/subjects'),
  getSubject: (id) => apiClient.get(`/subjects/${id}`),
  createSubject: (subjectData) => apiClient.post('/subjects', subjectData),
  updateSubject: (id, subjectData) => apiClient.put(`/subjects/${id}`, subjectData),
  deleteSubject: (id) => apiClient.delete(`/subjects/${id}`),
  getSubjectTopics: (id) => apiClient.get(`/subjects/${id}/topics`),
  
  // Topic endpoints
  getTopics: (subjectId) => apiClient.get(`/topics?subject=${subjectId}`),
  getAllTopics: () => apiClient.get('/topics'),
  createTopic: (topicData) => apiClient.post('/topics', topicData),
  updateTopic: (id, topicData) => apiClient.put(`/topics/${id}`, topicData),
  deleteTopic: (id) => apiClient.delete(`/topics/${id}`),
  
  // Question endpoints
  getQuestions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/questions${queryString ? `?${queryString}` : ''}`);
  },
  getQuestion: (id) => apiClient.get(`/questions/${id}`),
  createQuestion: (questionData) => apiClient.post('/questions', questionData),
  updateQuestion: (id, questionData) => apiClient.put(`/questions/${id}`, questionData),
  deleteQuestion: (id) => apiClient.delete(`/questions/${id}`),
  bulkCreateQuestions: (questions) => apiClient.post('/questions/bulk', { questions }),
  importQuestionsFromExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  downloadQuestionTemplate: () => apiClient.get('/questions/template', {
    responseType: 'blob',
  }),
  
  // Test endpoints
  getTests: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/tests${queryString ? `?${queryString}` : ''}`);
  },
  getTest: (id) => apiClient.get(`/tests/${id}`),
  createTest: (testData) => apiClient.post('/tests', testData),
  updateTest: (id, testData) => apiClient.put(`/tests/${id}`, testData),
  deleteTest: (id) => apiClient.delete(`/tests/${id}`),

  // Test report endpoints
  getStudentReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/tests/reports/students${queryString ? `?${queryString}` : ''}`);
  },
  getTestAttendance: (testId) => apiClient.get(`/tests/${testId}/attendance`),

  // Test attempt endpoints
  startTest: (testId) => apiClient.post(`/attempts/start/${testId}`),
  getAttempt: (attemptId) => apiClient.get(`/attempts/${attemptId}`),
  saveAnswers: (attemptId, answers) => apiClient.put(`/attempts/${attemptId}/answers`, { answers }),
  submitTest: (attemptId, answers) => apiClient.post(`/attempts/${attemptId}/submit`, { answers }),

  // Results endpoints
  getMyResults: () => apiClient.get('/attempts/results/my'),
  getAllResults: () => apiClient.get('/attempts/results'),
  getAttemptReview: (attemptId) => apiClient.get(`/attempts/${attemptId}/review`),
  getTestAttempts: (testId) => apiClient.get(`/attempts/test/${testId}`),
  getImprovementAnalysis: (testId) => apiClient.get(`/attempts/${testId}/improvement`),
  
  // Dashboard endpoints
  getDashboardStats: () => apiClient.get('/dashboard/stats'),
  getRecentActivity: () => apiClient.get('/dashboard/activity'),
  
  // User management (for teachers/admins)
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/users${queryString ? `?${queryString}` : ''}`);
  },
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  
  // Analytics endpoints
  getTestAnalytics: (testId) => apiClient.get(`/analytics/tests/${testId}`),
  getSubjectAnalytics: (subjectId) => apiClient.get(`/analytics/subjects/${subjectId}`),
  getStudentAnalytics: (studentId) => apiClient.get(`/analytics/students/${studentId}`),

  // Bulk operations
  exportResults: (testId) => apiClient.get(`/tests/${testId}/export`, { responseType: 'blob' }),
  
  // Settings endpoints
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (settings) => apiClient.put('/settings', settings),
};

// Separate auth API for cleaner imports in AuthContext
export const authAPI = {
  register: api.register,
  login: api.login,
  getProfile: api.getProfile,
  updateProfile: api.updateProfile,
};

export default apiClient;