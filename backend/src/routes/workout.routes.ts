import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { logWorkout, getWeeklyExpenditure, deleteWorkout } from '../controllers/workout.controller';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(['workoutType', 'durationMins', 'caloriesBurned']), logWorkout);
router.get('/weekly', getWeeklyExpenditure);
router.delete('/:id', deleteWorkout);

export default router;
