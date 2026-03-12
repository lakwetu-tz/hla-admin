import { Router } from 'express';
import * as controller from './controller';
import { auth } from '../../core/middleware/auth.middleware';
import { checkPermission } from '../../core/guards/rbac.guard';

const router = Router();

/**
 * Staff Management Routes
 * Only SuperAdmins can manage other staff members
 */
router.get('/staff', auth, checkPermission('MANAGE_STAFF'), controller.getStaff);
router.post('/staff', auth, checkPermission('MANAGE_STAFF'), controller.createStaff);
router.patch('/staff/:id', auth, checkPermission('MANAGE_STAFF'), controller.updateStaff);
router.delete('/staff/:id', auth, checkPermission('MANAGE_STAFF'), controller.deleteStaff);

/**
 * Audit Log Routes
 */
router.get('/audit-logs', auth, checkPermission('VIEW_AUDIT_LOGS'), controller.getAuditLogs);

export default router;
