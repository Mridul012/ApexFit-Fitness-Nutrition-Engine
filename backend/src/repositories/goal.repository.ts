import prisma from '../config/prisma';
import { GoalType } from '@prisma/client';

export async function findByUser(userId: string) {
  return prisma.goal.findUnique({ where: { userId } });
}

export async function create(data: {
  userId: string;
  goalType: GoalType;
  targetWeightKg: number;
  targetDailyCalories: number;
}) {
  return prisma.goal.create({ data });
}

export async function update(
  userId: string,
  data: {
    goalType?: GoalType;
    targetWeightKg?: number;
    targetDailyCalories?: number;
  }
) {
  return prisma.goal.update({ where: { userId }, data });
}
