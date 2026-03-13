import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Audit Log Helper
 */
const createAuditLog = async (userId: string | undefined, action: string, details: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
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
              in: ['super_admin', 'finance_manager', 'event_manager']
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

  await createAuditLog(
      adminId,
      'CREATE_STAFF_MEMBER',
      `Created new staff member: ${data.name} with Password: ${tempPassword}`
    );

  return { ...user, tempPassword }; // Return temp password once for admin to share (In production, send email)
};

export const updateStaff = async (adminId: string, id: string, data: any) => {
  const { role: roleName, ...userData } = data;

  // 1. Update user basic info
  const updatedUser = await prisma.user.update({
    where: { id },
    // Only pass fields that exist on the User model
    data: userData,
    include: { roles: { include: { role: true } } }
  });

  // 2. Handle role update if provided
  if (roleName) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (role) {
      // Replace old roles with the new one
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({
        data: {
          userId: id,
          roleId: role.id
        }
      });
    }
  }

  // Fetch the final state for return and audit log
  const finalUser = await prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } }
  });

  await createAuditLog(
      adminId,
      'UPDATE_STAFF_MEMBER',
      `Updated staff profile for ${finalUser?.name} (${finalUser?.email}). Fields modified: ${Object.keys(data).join(', ')}`
    );

  return finalUser;
};

export const deleteStaff = async (adminId: string, id: string) => {
  const user = await prisma.user.delete({ where: { id } });

  await createAuditLog(
      adminId,
      'DELETE_STAFF_MEMBER',
      `Permanently removed staff member: ${user.name} (${user.email}) from the system`
    );

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
