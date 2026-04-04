import { Request, Response, NextFunction } from 'express';
import { register as registerUser, login as loginUser } from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await registerUser(req.body);
    res.status(201).json({ message: 'Account created successfully', userId });
  } catch (err) {
    if (err instanceof Error && err.message === 'Email already in use') {
      res.status(409).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, fullName } = await loginUser(req.body);
    res.status(200).json({ token, fullName });
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid credentials') {
      res.status(401).json({ message: err.message });
      return;
    }
    next(err);
  }
}
