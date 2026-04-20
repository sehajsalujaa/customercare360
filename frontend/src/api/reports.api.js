import axiosClient from './axiosClient';

export const reportsApi = {
  // POST /reports/generate
  generate: (data) => axiosClient.post('/reports/generate', data),

  // GET /reports/list — returns List<OperationalReport>
  getReports: () => axiosClient.get('/reports/list'),

  // GET /reports/export/{reportId} — CSV blob
  exportReport: (reportId) =>
    axiosClient.get(`/reports/export/${reportId}`, { responseType: 'blob' }),

  // GET /reports/dashboard?serviceType=&startDate=&endDate=
  getDashboard: (serviceType, startDate, endDate) =>
    axiosClient.get('/reports/dashboard', { params: { serviceType, startDate, endDate } }),

  // POST /kpi/threshold
  saveKpiThreshold: (data) => axiosClient.post('/kpi/threshold', data),
};