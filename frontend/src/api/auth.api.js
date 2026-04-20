import axiosClient from './axiosClient';

export const authApi = {
  // POST /auth/register — RegisterRequestDto: {username, email, phone, password}
  register: (data) => axiosClient.post('/auth/register', data),

  // POST /auth/verify-otp — OtpVerificationRequestDto: {emailOrPhone, otp}
  verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),

  // POST /auth/login — LoginRequestDto: {email, phone, password}
  // Returns LoginResponseDto: {accessToken, refreshToken}
  login: (data) => axiosClient.post('/auth/login', data),

  // POST /auth/refresh — body: {refreshToken}
  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),

  // POST /auth/logout-all?emailOrPhone=xxx
  logoutAll: (emailOrPhone) =>
    axiosClient.post(`/auth/logout-all?emailOrPhone=${encodeURIComponent(emailOrPhone)}`),

  // POST /auth/forgot-password — ForgotPasswordRequestDto: {emailOrPhone}
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),

  // POST /auth/reset-password — ResetPasswordRequestDto: {emailOrPhone, otpCode, newPassword}
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),

  // GET /admin/audit — returns List<AuthAudit>
  getAllAuditLogs: () => axiosClient.get('/admin/audit'),

  // GET /admin/audit/filter?email=&start=&end=
  filterAuditLogs: (params) => axiosClient.get('/admin/audit/filter', { params }),

  // GET /admin/audit/export/auth-audit — CSV download
  exportAuthAudit: () => axiosClient.get('/admin/audit/export/auth-audit', { responseType: 'blob' }),
};