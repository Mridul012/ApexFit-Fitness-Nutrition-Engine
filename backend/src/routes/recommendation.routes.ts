import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { generate, getUnread, markAsRead } from '../controllers/recommendation.controller';

const router = Router();

router.use(authenticate);

router.post('/generate', generate);
router.get('/unread', getUnread);
router.patch('/:id/read', markAsRead);

export default router;
