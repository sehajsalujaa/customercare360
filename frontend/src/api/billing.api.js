import axiosClient from './axiosClient';

export const billingApi = {
    // POST /billing/cycle — CreateBillingCycleDto: {serviceType, startDate, endDate, billDate}
    createCycle: (data) => axiosClient.post('/billing/cycle', data),

    // POST /billing/generate/{cycleId}
    generateBills: (cycleId) => axiosClient.post(`/billing/generate/${cycleId}`),

    // GET /billing/customer/{customerId} — Returns List<BillResponseDto>
    // BillResponseDto: {billId, usage, amount, dueDate, billStatus}
    getBillsForCustomer: (customerId) => axiosClient.get(`/billing/customer/${customerId}`),

    // PUT /billing/close/{cycleId}
    closeCycle: (cycleId) => axiosClient.put(`/billing/close/${cycleId}`),

    // GET /billing/exceptions — Returns List<Bill>
    getFailedBills: () => axiosClient.get('/billing/exceptions'),

    // POST /billing/retry/{billId}
    retryBill: (billId) => axiosClient.post(`/billing/retry/${billId}`),

    // POST /billing/customer/dispute — CreateDisputeDto: {billId, reason}
    raiseDispute: (data) => axiosClient.post('/billing/customer/dispute', data),

    // POST /billing/dispute/resolve
    // ResolveDisputeDto: {disputeId, status, amountDelta, approver, decisionReason}
    resolveDispute: (data) => axiosClient.post('/billing/dispute/resolve', data),

    // GET all bills (ADMIN)
    getAllBills: () => axiosClient.get('/billing/all'),

    // GET /billing/filter?status=&connectionType=&fromDate=&toDate=
    filterBills: (filters) => axiosClient.get('/billing/filter', { params: filters }),

    // PUT mark bill as paid
    markAsPaid: (billId) => axiosClient.put(`/billing/pay/${billId}`),

    // Customer payment action
    payMyBill: (billId) => axiosClient.put(`/billing/customer/pay/${billId}`),

    // GET /billing/summary
    getSummary: () => axiosClient.get('/billing/summary'),

    // GET /billing/cycles
    getCycles: () => axiosClient.get('/billing/cycles'),

    // GET /billing/disputes?status=
    getDisputes: (status = '') => axiosClient.get('/billing/disputes', { params: status ? { status } : {} }),

    // Tariff plans (ADMIN / BILLING_ANALYST)
    createTariffPlan: (data) => axiosClient.post('/billing/tariff-plans', data),
    getTariffPlans: () => axiosClient.get('/billing/tariff-plans'),

    // Customer self-service
    getMyBills: () => axiosClient.get('/customer/my-bills'),
    getMyDisputes: () => axiosClient.get('/customer/my-disputes'),
    getMyProfile: () => axiosClient.get('/customer/me'),
};
