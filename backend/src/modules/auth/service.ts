import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerUser = async (email: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, password: hashed } });
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } }
  });
  if (!user || !await bcrypt.compare(password, user.password)) throw new Error('Invalid credentials');

  // Transform roles for frontend
  const roles = user.roles.map((ur: { role: { name: string } }) => ur.role.name);
  return { ...user, roles };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } }
  });
  if (!user) return null;
  const roles = user.roles.map((ur: { role: { name: string } }) => ur.role.name);
  return { ...user, roles };
};

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};
