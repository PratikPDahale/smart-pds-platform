import api from '../../../api/axios';

const unwrap = (response) => response.data?.data;
const toLong = (value) => Number.parseInt(value, 10);
const toDouble = (value) => Number.parseFloat(value);

const inventoryService = {
  getAll: async () => unwrap(await api.get('/inventory')),
  getLowStock: async (threshold = 50) =>
    unwrap(await api.get('/inventory/low-stock', { params: { threshold } })),
  addStock: async ({ dealerId, productId, quantity }) =>
    unwrap(await api.post('/inventory/add-stock', {
      dealerId: toLong(dealerId),
      productId: toLong(productId),
      quantity: toDouble(quantity),
    })),
};

export default inventoryService;
