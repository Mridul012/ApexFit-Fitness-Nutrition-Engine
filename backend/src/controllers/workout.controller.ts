import { Request, Response, NextFunction } from 'express';
import { logWorkout as logWorkoutService, getWeeklyExpenditure as getWeeklyExpenditureService, deleteWorkout as deleteWorkoutService } from '../services/workout.service';

export async function logWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await logWorkoutService(req.userId, req.body);
    res.status(201).json(workout);
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyExpenditure(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await getWeeklyExpenditureService(req.userId);
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

export async function deleteWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteWorkoutService(String(req.params.id), req.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === 'Workout not found') {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
}
