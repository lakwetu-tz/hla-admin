import { UserRole } from './auth';

export interface User {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
  createdAt: string;
  roles: {
    role: {
      name: UserRole;
    };
  }[];
}

export interface StaffMember extends User {
  roleName: UserRole;
}

export interface CreateStaffDTO {
  email: string;
  name: string;
  role: 'FinanceManager' | 'EventManager';
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId: string | null;
  user: {
    name: string | null;
    email: string;
  } | null;
}
