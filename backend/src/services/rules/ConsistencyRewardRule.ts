import { RecommendationRule } from './RecommendationRule';

export class ConsistencyRewardRule extends RecommendationRule {
  readonly ruleName = 'ConsistencyRewardRule';

  evaluate(_meals: any[], workouts: any[], _goal: any) {
    if (workouts.length >= 5) {
      return {
        triggered: true,
        recType: 'workout_change' as const,
        message:
          'Excellent consistency this week you have hit your workout target. Keep up the momentum!',
      };
    }

    return null;
  }
}
