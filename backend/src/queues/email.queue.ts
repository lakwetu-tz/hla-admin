import { Queue, Worker } from 'bullmq';
import logger from '../core/utils/logger';
const connection = { connection: { host: 'localhost', port: 6379 } };
export const emailQueue = new Queue('emails', connection);

new Worker('emails', async job => {
  // Simulate email send
  logger.info(`Sending email: ${JSON.stringify(job.data)}`);
}, connection);