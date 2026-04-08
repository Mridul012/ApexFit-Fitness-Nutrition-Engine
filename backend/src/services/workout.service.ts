import { WorkoutType } from '@prisma/client';
import { create, findByUserAndDateRange, findByIdAndUser, deleteById } from '../repositories/workout.repository';

export async function logWorkout(
  userId: string,
  dto: {
    workoutType: WorkoutType;
    durationMins: number;
    caloriesBurned: number;
  }
) {
  return create({ userId, ...dto });
}

export async function getWeeklyExpenditure(userId: string) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);

  const workouts = await findByUserAndDateRange(userId, from, to);

  const totalCaloriesBurned = workouts.reduce(
    (sum, w) => sum + w.caloriesBurned.toNumber(),
    0
  );
  const totalDurationMins = workouts.reduce((sum, w) => sum + w.durationMins, 0);
  const workoutCount = workouts.length;

  const serializedWorkouts = workouts.map((w) => ({
    ...w,
    caloriesBurned: w.caloriesBurned.toNumber(),
  }));

  return { totalCaloriesBurned, totalDurationMins, workoutCount, workouts: serializedWorkouts };
}

export async function deleteWorkout(id: string, userId: string) {
  const workout = await findByIdAndUser(id, userId);
  if (!workout) throw new Error('Workout not found');
  return deleteById(id);
}
