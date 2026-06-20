import api from '../../../api/axios';

const unwrap = (response) => response.data?.data;

const CitizenService = {
  getAll: async () => unwrap(await api.get('/citizens')),
  getByDealer: async (dealerId) => unwrap(await api.get(`/citizens/dealer/${dealerId}`)),
  create: async (payload) => unwrap(await api.post('/citizens', payload)),
  update: async (id, payload) => unwrap(await api.put(`/citizens/${id}`, payload)),
  assignDealer: async (citizenId, dealerId) =>
    unwrap(await api.patch(`/citizens/${citizenId}/assign-dealer/${dealerId}`)),
  remove: async (id) => unwrap(await api.delete(`/citizens/${id}`)),
};

export default CitizenService;
