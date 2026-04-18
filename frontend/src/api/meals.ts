import api from './axios';

export async function logMeal(data: {
  mealName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  const response = await api.post('/meals', data);
  return response.data;
}

export async function getDailyMeals(date: string) {
  const response = await api.get('/meals/daily', { params: { date } });
  return response.data;
}

export async function deleteMeal(id: string) {
  const response = await api.delete(`/meals/${id}`);
  return response.data;
}
