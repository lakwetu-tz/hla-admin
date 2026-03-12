import { Request, Response } from 'express';
import * as userService from './service';
import logger from '../../core/utils/logger';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await userService.getStaff();
    res.json(staff);
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const { email, name, role } = req.body;

    const result = await userService.createStaff(adminId, { email, name, roleName: role });
    res.status(201).json(result);
  } catch (error: any) {
    logger.error(error);
    res.status(400).json({ error: error.message || 'Failed to create staff' });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const { id } = req.params;
    const data = req.body;

    // Ensure id is a string
    const staffId = Array.isArray(id) ? id[0] : id;

    const updated = await userService.updateStaff(adminId, staffId, data);
    res.json(updated);
  } catch (error: any) {
    logger.error(error);
    res.status(400).json({ error: 'Failed to update staff' });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const { id } = req.params;

    // Ensure id is a string
    const staffId = Array.isArray(id) ? id[0] : id;

    await userService.deleteStaff(adminId, staffId);
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error: any) {
    logger.error(error);
    res.status(400).json({ error: 'Failed to delete staff' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await userService.getAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
