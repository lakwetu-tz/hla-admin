import api from './api';
import { CreateStaffDTO, StaffMember, AuditLog } from '../types/user';

export const userService = {
  getStaff: async (): Promise<StaffMember[]> => {
    const response = await api.get('/users/staff');
    return response.data;
  },

  createStaff: async (data: CreateStaffDTO): Promise<StaffMember & { tempPassword?: string }> => {
    const response = await api.post('/users/staff', data);
    return response.data;
  },

  updateStaff: async (id: string, data: Partial<CreateStaffDTO>): Promise<StaffMember> => {
    const response = await api.patch(`/users/staff/${id}`, data);
    return response.data;
  },

  deleteStaff: async (id: string): Promise<void> => {
    await api.delete(`/users/staff/${id}`);
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get('/users/audit-logs');
    return response.data;
  }
};
