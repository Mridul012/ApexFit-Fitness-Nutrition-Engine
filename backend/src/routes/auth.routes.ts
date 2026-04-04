import { Router } from 'express';
import { validateBody } from '../middleware/validate.middleware';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validateBody(['email', 'password', 'fullName']), register);
router.post('/login', validateBody(['email', 'password']), login);

export default router;
