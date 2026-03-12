import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Checks if the user has a specific permission.
 */
export const checkPermission = (permission: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const userWithRoles = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        if (!userWithRoles) return res.status(401).json({ error: 'Unauthorized' });

        const hasPerm = userWithRoles.roles.some(ur =>
            ur.role.permissions.some(rp => rp.permission.name === permission)
        );

        if (!hasPerm) return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token or session' });
    }
};

/**
 * Checks if the user has any of the specified roles.
 * Useful for high-level module access (e.g. SuperAdmin only).
 */
export const hasRole = (allowedRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: { include: { role: true } } }
    });

    const userRoles = userWithRoles?.roles.map(ur => ur.role.name) || [];
    const hasAccess = allowedRoles.some(role => userRoles.includes(role));

    if (!hasAccess) return res.status(403).json({ error: 'Forbidden: Access denied for your role' });

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
