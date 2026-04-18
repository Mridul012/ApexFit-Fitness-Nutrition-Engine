import api from './axios';

export async function createGoal(data: {
  goalType: string;
  targetWeightKg?: number;
  targetDailyCalories?: number;
}) {
  const response = await api.post('/goals', data);
  return response.data;
}

export async function updateGoal(data: {
  goalType?: string;
  targetWeightKg?: number;
  targetDailyCalories?: number;
}) {
  const response = await api.patch('/goals', data);
  return response.data;
}

export async function getGoals() {
  const response = await api.get('/goals');
  return response.data;
}
