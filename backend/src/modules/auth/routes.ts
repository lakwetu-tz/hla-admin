import { Router } from 'express';
import { login, refresh, me, logout } from './controller';
import { validate } from '../../core/middleware/validate.middleware';
import { loginSchema } from '../../core/validators/auth.validator';
import { auth } from '../../core/middleware/auth.middleware';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/me', auth, me);
router.post('/logout', logout);

export default router;
