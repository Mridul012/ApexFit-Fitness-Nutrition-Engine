import { Request, Response, NextFunction } from 'express';
import { trackProgress as trackProgressService, analyzeTrend, deleteEntry as deleteEntryService } from '../services/progress.service';

export async function trackProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await trackProgressService(req.userId, req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const trend = await analyzeTrend(req.userId);
    res.status(200).json(trend);
  } catch (err) {
    next(err);
  }
}

export async function deleteEntry(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteEntryService(String(req.params.id), req.userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === 'Entry not found') {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
}
