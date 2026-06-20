import api from '../../../api/axios';
import axios from 'axios';

const unwrap = (response) => response.data?.data;
const unwrapMl = (response) => response.data;

const resolveMlBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_ML_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  return 'http://localhost:8082/api';
};

const mlApi = axios.create({
  baseURL: resolveMlBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resolveMlVisualUrl = (path) => {
  const configuredUrl = import.meta.env.VITE_ML_VISUAL_BASE_URL?.trim() || 'http://localhost:5000';
  return `${configuredUrl}${path}`;
};

const forecastService = {
  getAllPredictions: async () => unwrap(await api.get('/predictions')),
  generateForDealer: async (dealerId, predictionMonth) =>
    unwrap(await api.post('/predictions/generate-for-dealer', null, {
      params: { dealerId, predictionMonth },
    })),
  generateFutureForDealer: async (dealerId, months) =>
    unwrap(await api.post('/predictions/generate-future-for-dealer', null, {
      params: { dealerId, months },
    })),
  getMlMetadata: async () => unwrapMl(await mlApi.get('/forecast/metadata')),
  getMlSummary: async () => unwrapMl(await mlApi.get('/forecast/summary')),
  getMlHistory: async (fpsId, commodity) =>
    unwrapMl(await mlApi.get('/forecast/history', {
      params: { fpsId, commodity },
    })),
  predictMlDemand: async ({ fpsId, commodity, month, year }) =>
    unwrapMl(await mlApi.get('/forecast/predict', {
      params: { fpsId, commodity, month, year },
    })),
  predictMlBatch: async ({ fpsIds, commodities, month, year }) =>
    unwrapMl(await mlApi.post('/forecast/predict-batch', {
      fps_ids: fpsIds,
      commodities,
      month,
      year,
    })),
  getMlVisuals: async () => unwrapMl(await mlApi.get('/forecast/visuals')),
};

export default forecastService;
