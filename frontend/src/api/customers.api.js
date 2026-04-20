import axiosClient from './axiosClient';

export const customersApi = {
  // POST /agent/create-customer
  // CreateCustomerDto: {username, email, phone, password, name, address, countryCode, regionCode, customerType}
  create: (data) => axiosClient.post('/agent/create-customer', data),

  // PUT /agent/customers/{customerId}/contact
  // UpdateCustomerContactDto: {email, phone, address, countryCode, regionCode}
  updateContact: (customerId, data) =>
    axiosClient.put(`/agent/customers/${customerId}/contact`, data),

  // GET /agent/customers/{customerId}/profile?page=0&size=10
  // Returns CustomerProfileResponseDto
  getProfile: (customerId, page = 0, size = 10) =>
    axiosClient.get(`/agent/customers/${customerId}/profile`, { params: { page, size } }),

  // POST /agent/service-accounts
  // CreateServiceAccountDto: {customerId, serviceType, startDate}
  createServiceAccount: (data) => axiosClient.post('/agent/service-accounts', data),

  // POST /agent/link-premise
  // LinkPremiseDto: {serviceAccountId, address, region, meterId}
  linkPremise: (data) => axiosClient.post('/agent/link-premise', data),

  // POST /agent/service-agreement
  // RecordServiceAgreementDto: {serviceAccountId, termStartDate, termEndDate, tariffCode, specialNotes}
  recordAgreement: (data) => axiosClient.post('/agent/service-agreement', data),

  // PUT /agent/request/priority
  // UpdateRequestPriorityDto — update request priority
  updateRequestPriority: (data) => axiosClient.put('/agent/request/priority', data),
};