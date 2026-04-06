import { GoalType } from '@prisma/client';
import {
  findByUser,
  create,
  update,
} from '../repositories/goal.repository';

export async function setGoal(
  userId: string,
  dto: { goalType: GoalType; targetWeightKg: number; targetDailyCalories: number }
) {
  const existing = await findByUser(userId);
  if (existing) {
    throw new Error('Goal already exists, use update instead');
  }
  return create({ userId, ...dto });
}

export async function updateGoal(
  userId: string,
  dto: { goalType?: GoalType; targetWeightKg?: number; targetDailyCalories?: number }
) {
  const existing = await findByUser(userId);
  if (!existing) {
    throw new Error('No goal found');
  }
  return update(userId, dto);
}

export async function getGoal(userId: string) {
  const goal = await findByUser(userId);
  if (!goal) {
    throw new Error('No goal found');
  }
  return goal;
}
