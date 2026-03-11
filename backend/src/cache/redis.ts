import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });
client.connect().catch(console.error);



export const getCache = async (key: string) => {
    const cached = await client.get(key);
    return JSON.parse(typeof cached === 'string' ? cached : 'null')
}

export const setCache = async (key: string, value: any, ttl = 3600) => client.set(key, JSON.stringify(value), { EX: ttl });

export default client;