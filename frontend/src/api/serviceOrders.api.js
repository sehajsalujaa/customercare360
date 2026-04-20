import axiosClient from './axiosClient';

export const serviceOrdersApi = {
  // POST /customer/service-request
  raiseServiceRequest: (data) => axiosClient.post('/customer/service-request', data),

  // GET /customer/request-status/{requestId}
  getRequestStatus: (requestId) => axiosClient.get(`/customer/request-status/${requestId}`),

  // POST /field/service-order
  createServiceOrder: (data) => axiosClient.post('/field/service-order', data),

  // PUT /field/assign-order
  assignOrder: (data) => axiosClient.put('/field/assign-order', data),

  // PUT /field/complete-order
  completeOrder: (data) => axiosClient.put('/field/complete-order', data),

  // GET /field/orders?status=SCHEDULED|IN_PROGRESS|COMPLETED|FAILED
  getOrders: (status = '') => axiosClient.get('/field/orders', { params: status ? { status } : {} }),

  // GET /field/service-requests
  getServiceRequests: () => axiosClient.get('/field/service-requests'),

  // GET /field/premises
  getPremises: () => axiosClient.get('/field/premises'),

  // GET /field/service-accounts?customerId=
  getServiceAccounts: (customerId = '') => axiosClient.get('/field/service-accounts', { params: customerId ? { customerId } : {} }),

  // GET /customer/my-requests
  getMyRequests: () => axiosClient.get('/customer/my-requests'),

  // POST /field/meter-readings
  submitMeterReading: (data) => axiosClient.post('/field/meter-readings', data),

  // PUT /field/meter-readings/{readingId}/validate
  validateMeterReading: (readingId, data) => axiosClient.put(`/field/meter-readings/${readingId}/validate`, data),

  // GET /field/meter-readings/pending
  getPendingMeterReadings: () => axiosClient.get('/field/meter-readings/pending'),
};
