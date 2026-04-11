import { Request, Response, NextFunction } from 'express';
import {
  generateRecommendations,
  getUnreadRecommendations,
  markAsRead as markAsReadService,
} from '../services/recommendation.service';

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const recommendations = await generateRecommendations(req.userId);
    res.status(201).json({ generated: recommendations.length, recommendations });
  } catch (err) {
    next(err);
  }
}

export async function getUnread(req: Request, res: Response, next: NextFunction) {
  try {
    const recommendations = await getUnreadRecommendations(req.userId);
    res.status(200).json(recommendations);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await markAsReadService(req.params['id'] as string, req.userId);
    res.status(200).json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
}
