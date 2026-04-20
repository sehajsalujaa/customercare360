import axiosClient from './axiosClient';

export const complaintsApi = {
  // POST /complaints/create
  // CreateComplaintDto: {userId, complaintCategory, description}
  create: (data) => axiosClient.post('/complaints/create', data),

  // POST /complaints/resolve
  // ResolveComplaintDto: {complaintId, complaintStatus, resolutionNotes}
  resolve: (data) => axiosClient.post('/complaints/resolve', data),

  // GET /complaints
  // Get all complaints
  getAll: () => axiosClient.get('/complaints'),

  // GET /complaints/{complaintId}
  // Get complaint by ID
  getById: (complaintId) => axiosClient.get(`/complaints/${complaintId}`),

  // GET /complaints/filter
  // Filter complaints by status, category, userId, date range
  filter: (params) => axiosClient.get('/complaints/filter', { params }),

  // GET /customer/my-complaints
  getMyComplaints: () => axiosClient.get('/customer/my-complaints'),
};