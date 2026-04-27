import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // For sending cookies
});

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      checkAuth: async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            set({ user: res.data.user, isAuthenticated: true });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          if (res.data.success) {
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
            return res.data;
          }
        } catch (error) {
          set({ isLoading: false });
          throw error.response?.data || { message: 'Login failed' };
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/signup', { name, email, password });
          set({ isLoading: false });
          return res.data;
        } catch (error) {
          set({ isLoading: false });
          throw error.response?.data || { message: 'Signup failed' };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error(error);
        }
      },
    }),
    {
      name: 'auth-storage', // Save state to localStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export { useAuthStore, api };
