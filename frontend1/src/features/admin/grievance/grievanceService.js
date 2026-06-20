import api from '../../../api/axios';

const unwrap = (response) => response.data?.data;
const toLong = (value) => Number.parseInt(value, 10);

const grievanceService = {
  create: async ({ citizenId, dealerId, subject, category, description, priority }) =>
    unwrap(await api.post('/grievances', {
      citizenId: toLong(citizenId),
      dealerId: dealerId ? toLong(dealerId) : undefined,
      subject,
      category,
      description,
      priority,
    })),
  getAll: async (status) =>
    unwrap(await api.get('/grievances', {
      params: status ? { status } : undefined,
    })),
  getByCitizen: async (citizenId) =>
    unwrap(await api.get(`/grievances/citizen/${toLong(citizenId)}`)),
  getByDealer: async (dealerId) =>
    unwrap(await api.get(`/grievances/dealer/${toLong(dealerId)}`)),
  updateStatus: async (id, { status, response }) =>
    unwrap(await api.patch(`/grievances/${id}/status`, { status, response })),
};

export default grievanceService;
