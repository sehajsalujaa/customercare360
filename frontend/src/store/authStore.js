import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  roles: [],
  accessToken: localStorage.getItem('cc360_access_token') || null,

  setAuth: (user, roles, accessToken, refreshToken) => {
    localStorage.setItem('cc360_access_token', accessToken);
    localStorage.setItem('cc360_refresh_token', refreshToken);
    set({ user, roles, accessToken });
  },

  clearAuth: () => {
    localStorage.removeItem('cc360_access_token');
    localStorage.removeItem('cc360_refresh_token');
    set({ user: null, roles: [], accessToken: null });
  },

  hasRole: (role) => {
    const { roles } = useAuthStore.getState();
    return roles.includes(role);
  },
}));