import { Request, Response, NextFunction } from 'express';
import {
  setGoal as setGoalService,
  updateGoal as updateGoalService,
  getGoal as getGoalService,
} from '../services/goal.service';
import { Decimal } from '@prisma/client/runtime/library';

function serializeGoal(goal: {
  id: string;
  userId: string;
  goalType: string;
  targetWeightKg: Decimal;
  targetDailyCalories: Decimal;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...goal,
    targetWeightKg: goal.targetWeightKg.toNumber(),
    targetDailyCalories: goal.targetDailyCalories.toNumber(),
  };
}

export async function setGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await setGoalService(req.userId, req.body);
    res.status(201).json(serializeGoal(goal));
  } catch (err) {
    if (err instanceof Error && err.message === 'Goal already exists, use update instead') {
      res.status(409).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await updateGoalService(req.userId, req.body);
    res.status(200).json(serializeGoal(goal));
  } catch (err) {
    if (err instanceof Error && err.message === 'No goal found') {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function getGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await getGoalService(req.userId);
    res.status(200).json(serializeGoal(goal));
  } catch (err) {
    if (err instanceof Error && err.message === 'No goal found') {
      res.status(200).json(null);
      return;
    }
    next(err);
  }
}
