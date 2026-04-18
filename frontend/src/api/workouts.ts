import api from './axios';

export async function logWorkout(data: {
  workoutType: string;
  durationMins: number;
  caloriesBurned: number;
}) {
  const response = await api.post('/workouts', data);
  return response.data;
}

export async function getWeeklyWorkouts() {
  const response = await api.get('/workouts/weekly');
  return response.data;
}

export async function deleteWorkout(id: string) {
  const response = await api.delete(`/workouts/${id}`);
  return response.data;
}
