import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { setGoal, updateGoal, getGoal } from '../controllers/goal.controller';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(['goalType', 'targetWeightKg', 'targetDailyCalories']), setGoal);
router.patch('/', updateGoal);
router.get('/', getGoal);

export default router;
