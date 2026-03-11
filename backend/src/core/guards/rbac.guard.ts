import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const checkPermission = (permission: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
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

        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // Correctly traverse the Prisma relations to find the permission name
        const hasPerm = user.roles.some(ur =>
            ur.role.permissions.some(rp => rp.permission.name === permission)
        );

        if (!hasPerm) return res.status(403).json({ error: 'Forbidden' });

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
