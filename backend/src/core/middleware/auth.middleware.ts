import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    (req as any).user = decoded;
    next();
  } catch (error: any) {
    // Corrected pino logging: pino.error(error, message) or pino.error(message, details)
    logger.error({ err: error }, 'Auth Middleware Error');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
