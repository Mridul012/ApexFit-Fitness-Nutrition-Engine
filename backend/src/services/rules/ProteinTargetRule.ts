import { GoalType } from '@prisma/client';
import { RecommendationRule } from './RecommendationRule';

export class ProteinTargetRule extends RecommendationRule {
  readonly ruleName = 'ProteinTargetRule';

  evaluate(meals: any[], _workouts: any[], goal: any) {

    const threshold = goal.goalType === GoalType.muscle_gain ? 0.10 : 0.075;
    const avgProtein = meals.reduce((sum: number, m: any) => sum + m.proteinG.toNumber(), 0) / 7;

    if (avgProtein < goal.targetDailyCalories.toNumber() * threshold) {
      return {
        triggered: true,
        recType: 'diet_adjustment' as const,
        message:
          goal.goalType === GoalType.muscle_gain
            ? 'Your protein intake is too low for muscle gain. Aim for more protein-rich foods like chicken, eggs, and legumes.'
            : 'Your protein intake appears low for your goal. Try adding more protein-rich foods like eggs, chicken, or legumes.',
      };
    }

    return null;
  }
}
