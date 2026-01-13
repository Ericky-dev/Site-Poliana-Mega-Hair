import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  facebookLogin: () => window.location.href = `${API_URL}/api/auth/facebook`
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
};

// Appointments API
export const appointmentsAPI = {
  getAvailable: (date, serviceId) =>
    api.get('/appointments/available', { params: { date, service_id: serviceId } }),
  create: (data) => api.post('/appointments', data),
  getById: (id) => api.get(`/appointments/${id}`),
  getAll: (params) => api.get('/appointments', { params }),
  confirm: (id) => api.patch(`/appointments/${id}/confirm`),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  complete: (id) => api.patch(`/appointments/${id}/complete`)
};

// Payments API
export const paymentsAPI = {
  generatePix: (appointmentId) => api.post('/payments/pix', { appointment_id: appointmentId }),
  getById: (id) => api.get(`/payments/${id}`),
  getAll: (params) => api.get('/payments', { params })
};

// Social API
export const socialAPI = {
  getInstagramFeed: (limit = 6) => api.get('/social/instagram', { params: { limit } }),
  getLinks: () => api.get('/social/links')
};

// Admin API
export const adminAPI = {
  getEmailStats: () => api.get('/admin/emails/stats'),
  exportEmails: (format = 'json', source = 'all') =>
    api.get('/admin/emails/export', { params: { format, source } }),
  downloadEmailsCsv: () => {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/api/admin/emails/export?format=csv`;
    window.open(url + `&token=${token}`, '_blank');
  }
};

export default api;
