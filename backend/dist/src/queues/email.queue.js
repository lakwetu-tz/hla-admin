"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = __importDefault(require("../core/utils/logger"));
const connection = { connection: { host: 'localhost', port: 6379 } };
exports.emailQueue = new bullmq_1.Queue('emails', connection);
new bullmq_1.Worker('emails', async (job) => {
    // Simulate email send
    logger_1.default.info(`Sending email: ${JSON.stringify(job.data)}`);
}, connection);
