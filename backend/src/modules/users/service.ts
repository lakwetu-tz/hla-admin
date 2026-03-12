import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Audit Log Helper
 */
const createAuditLog = async (userId: string | undefined, action: string, details: any) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const getUsers = async () => {
  return prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getStaff = async () => {
  return prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: {
              in: ['SuperAdmin', 'FinanceManager', 'EventManager']
            }
          }
        }
      }
    },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const createStaff = async (adminId: string, data: { email: string, name: string, roleName: string }) => {
  const tempPassword = Math.random().toString(36).slice(-8); // Generate temp password
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      isVerified: true,
    }
  });

  const role = await prisma.role.findUnique({ where: { name: data.roleName } });
  if (role) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id
      }
    });
  }

  await createAuditLog(adminId, 'CREATE_STAFF_MEMBER', {
    targetUserId: user.id,
    email: data.email,
    role: data.roleName
  });

  return { ...user, tempPassword }; // Return temp password once for admin to share (In production, send email)
};

export const updateStaff = async (adminId: string, id: string, data: any) => {
  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    include: { roles: { include: { role: true } } }
  });

  await createAuditLog(adminId, 'UPDATE_STAFF_MEMBER', { targetUserId: id, changes: data });

  return updatedUser;
};

export const deleteStaff = async (adminId: string, id: string) => {
  const user = await prisma.user.delete({ where: { id } });

  await createAuditLog(adminId, 'DELETE_STAFF_MEMBER', { targetUserId: id, email: user.email });

  return user;
};

export const getAuditLogs = async () => {
  return prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { timestamp: 'desc' }
  });
};
