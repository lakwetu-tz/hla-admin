import { Request, Response } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from './service';
import { setCache, getCache } from '../../cache/redis';

export const listUsers = async (req: Request, res: Response) => {
  const cached = await getCache('users');
  if (cached) return res.json(cached);
  const users = await getUsers();
  await setCache('users', users);
  res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id as string);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

export const update = async (req: Request, res: Response) => {
  const user = await updateUser(req.params.id as string, req.body);
  res.json(user);
};

export const remove = async (req: Request, res: Response) => {
  await deleteUser(req.params.id as string);
  res.json({ message: 'User deleted' });
};