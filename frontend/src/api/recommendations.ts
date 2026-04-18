import api from './axios';

export async function generateRecommendations() {
  const response = await api.post('/recommendations/generate');
  return response.data;
}

export async function getUnreadRecommendations() {
  const response = await api.get('/recommendations/unread');
  return response.data;
}

export async function markAsRead(id: string) {
  const response = await api.patch(`/recommendations/${id}/read`);
  return response.data;
}
