import api from '../../../api/axios';

const unwrap = (response) => response.data?.data;

const DealerService = {
  getAll: async () => unwrap(await api.get('/dealers')),
  getPending: async () => unwrap(await api.get('/dealers/pending')),
  getByStatus: async (status) => unwrap(await api.get(`/dealers/status/${status}`)),
  create: async (payload) => unwrap(await api.post('/dealers', payload)),
  update: async (id, payload) => unwrap(await api.put(`/dealers/${id}`, payload)),
  activate: async (id) => unwrap(await api.patch(`/dealers/${id}/activate`)),
  deactivate: async (id) => unwrap(await api.patch(`/dealers/${id}/deactivate`)),
  approve: async (id, payload) => unwrap(await api.post(`/dealers/${id}/approve`, payload)),
  remove: async (id) => unwrap(await api.delete(`/dealers/${id}`)),
};

export default DealerService;
