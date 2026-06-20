import api from '../../../api/axios';

const unwrap = (response) => response.data?.data;

const ProductService = {
  getAll: async () => unwrap(await api.get('/products')),
  getActive: async () => unwrap(await api.get('/products/active')),
  getByCategory: async (category) => unwrap(await api.get(`/products/category/${encodeURIComponent(category)}`)),
  create: async (payload) => unwrap(await api.post('/products', payload)),
  update: async (id, payload) => unwrap(await api.put(`/products/${id}`, payload)),
  remove: async (id) => unwrap(await api.delete(`/products/${id}`)),
};

export default ProductService;
