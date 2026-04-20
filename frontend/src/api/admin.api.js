import axiosClient from './axiosClient';

export const adminApi = {
  // POST /admin/create-agent — CreateAgentRequestDto: {username, email, phone}
  createAgent: (data) => axiosClient.post('/admin/create-agent', data),

  // POST /admin/users — AdminCreateUserRequestDto: { username, email, phone, roleName }
  createUserWithRole: (data) => axiosClient.post('/admin/users', data),

  // GET /admin/roles
  getRoles: () => axiosClient.get('/admin/roles'),

  // POST /admin/roles — RoleRequestDto: { name }
  createRole: (data) => axiosClient.post('/admin/roles', data),

  // PUT /admin/roles/{roleId}
  updateRole: (roleId, data) => axiosClient.put(`/admin/roles/${roleId}`, data),

  // DELETE /admin/roles/{roleId}
  deleteRole: (roleId) => axiosClient.delete(`/admin/roles/${roleId}`),

  // GET /admin/users?search=...
  getUsersForRoles: (search = '') => axiosClient.get('/admin/users', { params: { search } }),

  // PUT /admin/users/{userId}/roles — UpdateUserRolesRequestDto: { roles: [] }
  updateUserRoles: (userId, roles) => axiosClient.put(`/admin/users/${userId}/roles`, { roles }),

  // DELETE /admin/users/{userId}
  deleteUser: (userId) => axiosClient.delete(`/admin/users/${userId}`),

  // PUT /admin/customers/{customerId}/approve
  approveCustomer: (customerId) => axiosClient.put(`/admin/customers/${customerId}/approve`),

  // PUT /admin/customers/{customerId}/reject
  // Optional body: { reason }
  rejectCustomer: (customerId, reason) =>
    axiosClient.put(`/admin/customers/${customerId}/reject`, reason ? { reason } : {}),

  // PUT /admin/customers/{customerId}/deactivate — body: {reason}
  deactivateCustomer: (customerId, reason) =>
    axiosClient.put(`/admin/customers/${customerId}/deactivate`, { reason }),

  // PUT /admin/customers/{customerId}/reactivate
  reactivateCustomer: (customerId) =>
    axiosClient.put(`/admin/customers/${customerId}/reactivate`),

  // GET /admin/customers/pending
  getPendingCustomers: () =>
    axiosClient.get(`/admin/customers/pending`),

  
};