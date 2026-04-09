import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { trackProgress, getTrend, deleteEntry } from '../controllers/progress.controller';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(['weightKg', 'bodyFatPercentage']), trackProgress);
router.get('/trend', getTrend);
router.delete('/:id', deleteEntry);

export default router;
