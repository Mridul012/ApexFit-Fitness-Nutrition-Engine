import { GoalType } from '@prisma/client';
import { RecommendationRule } from './RecommendationRule';

export class CalorieSurplusRule extends RecommendationRule {
  readonly ruleName = 'CalorieSurplusRule';

  evaluate(meals: any[], _workouts: any[], goal: any) {
    if (goal.goalType !== GoalType.muscle_gain) return null;

    const avgCalories = meals.reduce((sum: number, m: any) => sum + m.calories.toNumber(), 0) / 7;
    if (avgCalories < goal.targetDailyCalories.toNumber()) {
      return {
        triggered: true,
        recType: 'diet_adjustment' as const,
        message:
          'For muscle gain you need a calorie surplus. Your current intake is below your target try adding calorie-dense foods like nuts, oats, and whole milk.',
      };
    }

    return null;
  }
}
