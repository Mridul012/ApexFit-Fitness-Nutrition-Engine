import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { logMeal, getDailyIntake, deleteMeal } from '../controllers/meal.controller';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(['mealName', 'calories', 'proteinG', 'carbsG', 'fatG']), logMeal);
router.get('/daily', getDailyIntake);
router.delete('/:id', deleteMeal);

export default router;
