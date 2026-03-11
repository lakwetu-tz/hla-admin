"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCache = exports.getCache = void 0;
const redis_1 = require("redis");
const client = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
client.connect().catch(console.error);
const getCache = async (key) => {
    const cached = await client.get(key);
    return JSON.parse(typeof cached === 'string' ? cached : 'null');
};
exports.getCache = getCache;
const setCache = async (key, value, ttl = 3600) => client.set(key, JSON.stringify(value), { EX: ttl });
exports.setCache = setCache;
exports.default = client;
