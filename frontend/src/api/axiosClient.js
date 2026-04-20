import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8085/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc360_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 502) {
      return Promise.reject({ message: 'Backend service is unavailable. Start Spring Boot on port 8085 and try again.' });
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('cc360_refresh_token');
        const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
        const { accessToken } = res.data;
        localStorage.setItem('cc360_access_token', accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    const err = error.response?.data;
    return Promise.reject(err ?? { message: 'Something went wrong' });
  }
);

export default axiosClient;