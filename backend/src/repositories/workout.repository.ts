import prisma from '../config/prisma';
import { WorkoutType } from '@prisma/client';

export async function create(data: {
  userId: string;
  workoutType: WorkoutType;
  durationMins: number;
  caloriesBurned: number;
}) {
  return prisma.workout.create({ data });
}

export async function findByUserAndDateRange(userId: string, from: Date, to: Date) {
  return prisma.workout.findMany({
    where: {
      userId,
      loggedAt: { gte: from, lt: to },
    },
    orderBy: { loggedAt: 'asc' },
  });
}

export async function findByIdAndUser(id: string, userId: string) {
  return prisma.workout.findFirst({ where: { id, userId } });
}

export async function deleteById(id: string) {
  return prisma.workout.delete({ where: { id } });
}
