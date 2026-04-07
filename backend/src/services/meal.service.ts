import { create, findByUserAndDateRange, findByIdAndUser, deleteById } from '../repositories/meal.repository';

export async function logMeal(
  userId: string,
  dto: {
    mealName: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }
) {
  return create({ userId, ...dto });
}

export async function getDailyIntake(userId: string, date: Date) {

  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);

  const meals = await findByUserAndDateRange(userId, from, to);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories.toNumber(), 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.proteinG.toNumber(), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbsG.toNumber(), 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fatG.toNumber(), 0);

  const serializedMeals = meals.map((m) => ({
    ...m,
    calories: m.calories.toNumber(),
    proteinG: m.proteinG.toNumber(),
    carbsG: m.carbsG.toNumber(),
    fatG: m.fatG.toNumber(),
  }));

  return { totalCalories, totalProtein, totalCarbs, totalFat, meals: serializedMeals };
}

export async function deleteMeal(id: string, userId: string) {
  const meal = await findByIdAndUser(id, userId);
  if (!meal) throw new Error('Meal not found');
  return deleteById(id);
}
