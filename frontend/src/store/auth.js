import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,
      isLoading: false,

      async login({ email, password }) {
        set({ isLoading: true });
        try {
          const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
          set({ user: data.user, token: data.token });
          return data.user;
        } finally {
          set({ isLoading: false });
        }
      },

      async register(payload) {
        set({ isLoading: true });
        try {
          const { data } = await axios.post(`${API_URL}/auth/register`, payload);
          set({ user: data.user, token: data.token });
          return data.user;
        } finally {
          set({ isLoading: false });
        }
      },

      async refreshMe() {
        const token = get().token;
        if (!token) return null;
        try {
          const { data } = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: data.user });
          return data.user;
        } catch {
          set({ user: null, token: null });
          return null;
        }
      },

      setUser(user) {
        set({ user });
      },

      logout() {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'tt-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        state?.isHydrated !== undefined && (state.isHydrated = true);
      },
    }
  )
);
