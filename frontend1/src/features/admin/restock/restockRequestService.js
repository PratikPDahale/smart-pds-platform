import api from '../../../api/axios';

const unwrap = (response) => response.data?.data;
const toLong = (value) => Number.parseInt(value, 10);
const toDouble = (value) => Number.parseFloat(value);

const restockRequestService = {
  create: async ({ dealerId, productId, quantity, reason }) =>
    unwrap(await api.post('/restock-requests', {
      dealerId: toLong(dealerId),
      productId: toLong(productId),
      quantity: toDouble(quantity),
      reason,
    })),
  getAll: async (status) =>
    unwrap(await api.get('/restock-requests', {
      params: status ? { status } : undefined,
    })),
  getByDealer: async (dealerId) =>
    unwrap(await api.get(`/restock-requests/dealer/${toLong(dealerId)}`)),
  approve: async (id, adminRemarks = '') =>
    unwrap(await api.patch(`/restock-requests/${id}/approve`, { adminRemarks })),
  reject: async (id, adminRemarks = '') =>
    unwrap(await api.patch(`/restock-requests/${id}/reject`, { adminRemarks })),
};

export default restockRequestService;
