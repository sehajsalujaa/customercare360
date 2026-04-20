import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (data) => authApi.login(data).then(r => r.data),
    onSuccess: (data) => {
      // Adjust field names to match your Spring Boot response shape
      setAuth(data.user, data.roles, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user?.name}`);
    },
    onError: (err) => {
      toast.error(err?.message ?? 'Login failed');
    },
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      window.location.href = '/login';
    },
  });
};
