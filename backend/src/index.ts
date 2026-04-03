import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import mealRoutes from './routes/meal.routes';
import workoutRoutes from './routes/workout.routes';
import progressRoutes from './routes/progress.routes';
import goalRoutes from './routes/goal.routes';
import recommendationRoutes from './routes/recommendation.routes';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/meals', mealRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`ApexFit server running on port ${PORT}`);
});
