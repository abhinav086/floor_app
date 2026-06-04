import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://wms-backend-41bc.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Workers
export const workersAPI = {
  getAll: () => api.get('/workers'),
  getById: (id) => api.get(`/workers/${id}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  toggleStatus: (id, status) => api.patch(`/workers/${id}/status`, { status }),
  delete: (id) => api.delete(`/workers/${id}`),
};

// SKUs
export const skusAPI = {
  getAll: (params) => api.get('/skus', { params }),
  getById: (id) => api.get(`/skus/${id}`),
  getByBarcode: (code) => api.get(`/skus/barcode/${code}`),
  create: (data) => api.post('/skus', data),
  update: (id, data) => api.put(`/skus/${id}`, data),
  delete: (id) => api.delete(`/skus/${id}`),
};

// Bins
export const binsAPI = {
  getAll: () => api.get('/bins'),
  getById: (id) => api.get(`/bins/${id}`),
  create: (data) => api.post('/bins', data),
  update: (id, data) => api.put(`/bins/${id}`, data),
  delete: (id) => api.delete(`/bins/${id}`),
};

// Inventory
export const inventoryAPI = {
  search: (params) => api.get('/inventory', { params }),
  getLocations: (skuId) => api.get(`/inventory/${skuId}/locations`),
  getSummary: () => api.get('/inventory/summary'),
};

// Tasks
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  getNext: (workerId) => api.get('/tasks/next', { params: { worker_id: workerId } }),
  getPending: (workerId) => api.get('/tasks/pending', { params: { worker_id: workerId } }),
  getHistory: (workerId) => api.get('/tasks/history', { params: { worker_id: workerId } }),
  accept: (id, workerId) => api.post(`/tasks/${id}/accept`, { worker_id: workerId }),
  decline: (id) => api.post(`/tasks/${id}/decline`),
  complete: (id, data) => api.post(`/tasks/${id}/complete`, data),
};

// Orders
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
};

// Receipts
export const receiptsAPI = {
  getAll: () => api.get('/receipts'),
  getById: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
};

// Returns
export const returnsAPI = {
  getAll: () => api.get('/returns'),
  getById: (id) => api.get(`/returns/${id}`),
  create: (data) => api.post('/returns', data),
  setDisposition: (id, dispositions) => api.post(`/returns/${id}/disposition`, { dispositions }),
};

// Map
export const mapAPI = {
  getLayout: (params) => api.get('/map/layout', { params }),
};

// Scan
export const scanAPI = {
  scan: (data) => api.post('/scan', data),
};

// Seed
export const seedAPI = {
  seed: () => api.post('/seed'),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (ids) => api.post('/notifications/read', { notification_ids: ids }),
};
