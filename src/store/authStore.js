import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('wms_user') || 'null'),
  token: localStorage.getItem('wms_token') || null,
  isAuthenticated: !!localStorage.getItem('wms_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      const { token, user } = data.data;

      if (user.role !== 'worker') {
        throw new Error('Access denied. Workers only.');
      }

      localStorage.setItem('wms_token', token);
      localStorage.setItem('wms_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    try {
      const { data } = await authAPI.me();
      const user = data.data;
      if (user.role !== 'worker') {
        throw new Error('Access denied. Workers only.');
      }
      localStorage.setItem('wms_user', JSON.stringify(user));
      set({ user });
    } catch {
      // Ignore refresh failures, logout if invalid role
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;
