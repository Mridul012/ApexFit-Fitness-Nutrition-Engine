import { RecommendationRule } from './rules/RecommendationRule';
import { CalorieDeficitRule } from './rules/CalorieDeficitRule';
import { ProteinTargetRule } from './rules/ProteinTargetRule';
import { WorkoutFrequencyRule } from './rules/WorkoutFrequencyRule';
import { CalorieSurplusRule } from './rules/CalorieSurplusRule';
import { ConsistencyRewardRule } from './rules/ConsistencyRewardRule';
import { findByUser as findGoal } from '../repositories/goal.repository';
import { findByUserAndDateRange as findMeals } from '../repositories/meal.repository';
import { findByUserAndDateRange as findWorkouts } from '../repositories/workout.repository';
import {
  create,
  findUnreadByUser,
  markAsRead as markAsReadInDB,
  findByUserSince,
} from '../repositories/recommendation.repository';

const rules: RecommendationRule[] = [
  new CalorieDeficitRule(),
  new ProteinTargetRule(),
  new WorkoutFrequencyRule(),
  new CalorieSurplusRule(),
  new ConsistencyRewardRule(),
];

export async function generateRecommendations(userId: string) {
  const goal = await findGoal(userId);
  if (!goal) {
    return [];
  }

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const meals = await findMeals(userId, sevenDaysAgo, now);
  const workouts = await findWorkouts(userId, sevenDaysAgo, now);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRecs = await findByUserSince(userId, since);
  const recentMessages = new Set(recentRecs.map((r) => r.message));

  const created = [];

  for (const rule of rules) {
    const result = rule.evaluate(meals, workouts, goal);
    if (result === null) continue;
    if (recentMessages.has(result.message)) continue;

    const recommendation = await create({
      userId,
      recType: result.recType,
      message: result.message,
      appliedRules: { ruleName: rule.ruleName, triggeredAt: new Date() },
    });
    created.push(recommendation);
    recentMessages.add(result.message);
  }

  return created;
}

export async function getUnreadRecommendations(userId: string) {
  return findUnreadByUser(userId);
}

export async function markAsRead(id: string, userId: string) {
  return markAsReadInDB(id, userId);
}
