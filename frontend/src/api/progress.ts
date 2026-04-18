import api from './axios';

export async function logProgress(data: { weightKg: number; bodyFatPercentage: number }) {
  const response = await api.post('/progress', data);
  return response.data;
}

export async function getProgressTrend() {
  const response = await api.get('/progress/trend');
  return response.data;
}

export async function deleteProgressEntry(id: string) {
  const response = await api.delete(`/progress/${id}`);
  return response.data;
}
