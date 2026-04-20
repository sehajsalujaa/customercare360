import axiosClient from './axiosClient';

export const agentApi = {
  // GET /agent/dashboard/stats
  // Returns: { totalCustomers, pendingApprovals, complaintsMonth, openRequests }
  getStats: () => axiosClient.get('/agent/dashboard/stats'),

  // GET /agent/dashboard/recent-complaints?limit=5
  // Returns: Array of recent complaints
  getRecentComplaints: (limit = 5) => 
    axiosClient.get('/agent/dashboard/recent-complaints', { params: { limit } }),

  // GET /agent/dashboard/recent-activities?limit=5
  // Returns: Array of recent activities (created customers, requests, complaints)
  getRecentActivities: (limit = 5) => 
    axiosClient.get('/agent/dashboard/recent-activities', { params: { limit } }),

  // GET /agent/customers?page=0&size=10&search=
  // Returns: Paginated list of customers created by this agent
  getCustomers: (page = 0, size = 10, search = '') =>
    axiosClient.get('/agent/customers', { params: { page, size, search } }),

  // GET /agent/customers/{customerId}
  // Returns: Customer details with profile
  getCustomerById: (customerId) =>
    axiosClient.get(`/agent/customers/${customerId}`),

  // GET /agent/service-accounts?customerId=
  // Returns: Service accounts for a customer
  getServiceAccounts: (customerId) =>
    axiosClient.get('/agent/service-accounts', { params: { customerId } }),

  // GET /agent/complaints?page=0&size=10
  // Returns: Complaints logged by this agent
  getComplaints: (page = 0, size = 10) =>
    axiosClient.get('/agent/complaints', { params: { page, size } }),

  // GET /agent/requests?status=OPEN
  // Returns: Service requests created by this agent
  getRequests: (status = 'OPEN') =>
    axiosClient.get('/agent/requests', { params: { status } }),
};
