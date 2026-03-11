import { Router } from 'express';
import { listUsers, getUser, update, remove } from './controller';
import { authenticate } from '../../core/guards/auth.guard';
import { checkPermission } from '../../core/guards/rbac.guard';
const router = Router();

router.get('/', authenticate, checkPermission('view_users'), listUsers);
router.get('/:id', authenticate, checkPermission('view_user'), getUser);
router.put('/:id', authenticate, checkPermission('edit_user'), update);
router.delete('/:id', authenticate, checkPermission('delete_user'), remove);

export default router;