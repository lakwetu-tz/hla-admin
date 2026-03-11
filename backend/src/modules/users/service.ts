import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getUsers = async () => prisma.user.findMany({ include: { roles: true } });
export const getUserById = async (id: string) => prisma.user.findUnique({ where: { id }, include: { roles: true } });
export const updateUser = async (id: string, data: any) => prisma.user.update({ where: { id }, data });
export const deleteUser = async (id: string) => prisma.user.delete({ where: { id } });