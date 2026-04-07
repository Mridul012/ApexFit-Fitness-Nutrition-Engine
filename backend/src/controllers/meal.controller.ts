import { Request, Response, NextFunction } from 'express';
import { logMeal as logMealService, getDailyIntake as getDailyIntakeService, deleteMeal as deleteMealService } from '../services/meal.service';

export async function logMeal(req: Request, res: Response, next: NextFunction) {
  try {
    const meal = await logMealService(req.userId, req.body);
    res.status(201).json(meal);
  } catch (err) {
    next(err);
  }
}

export async function getDailyIntake(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date
      ? (() => {
          const [year, month, day] = (req.query.date as string).split('-').map(Number);
          return new Date(year, month - 1, day); // local midnight — no UTC offset confusion
        })()
      : new Date();
    const summary = await getDailyIntakeService(req.userId, date);
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

export async function deleteMeal(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteMealService(req.params['id'] as string, req.userId);
    res.status(200).json({ message: 'Meal deleted' });
  } catch (err) {
    if (err instanceof Error && err.message === 'Meal not found') {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
}
