import { RecommendationRule } from './RecommendationRule';

export class WorkoutFrequencyRule extends RecommendationRule {
  readonly ruleName = 'WorkoutFrequencyRule';

  evaluate(_meals: any[], workouts: any[], _goal: any) {
    if (workouts.length < 3) {
      return {
        triggered: true,
        recType: 'workout_change' as const,
        message:
          'You have logged fewer than 3 workouts this week. Aim for at least 3 sessions to maintain consistent progress.',
      };
    }

    return null;
  }
}
