import { GoalType } from '@prisma/client';
import { RecommendationRule } from './RecommendationRule';

export class CalorieDeficitRule extends RecommendationRule {
  readonly ruleName = 'CalorieDeficitRule';

  evaluate(meals: any[], _workouts: any[], goal: any) {

    if (goal.goalType === GoalType.muscle_gain) return null;

    const avgCalories = meals.reduce((sum: number, m: any) => sum + m.calories.toNumber(), 0) / 7;
    if (avgCalories < goal.targetDailyCalories.toNumber() * 0.85) {
      return {
        triggered: true,
        recType: 'diet_adjustment' as const,
        message:
          'Your average calorie intake is significantly below your target. Consider increasing your daily food intake to avoid muscle loss.',
      };
    }

    return null;
  }
}
