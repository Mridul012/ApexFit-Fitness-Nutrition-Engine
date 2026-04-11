export abstract class RecommendationRule {
  abstract readonly ruleName: string;
  abstract evaluate(
    meals: any[],
    workouts: any[],
    goal: any
  ): { triggered: boolean; recType: 'diet_adjustment' | 'workout_change'; message: string } | null;
}
