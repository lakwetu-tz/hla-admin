import request from 'supertest';
import app from '../src/server'; // Adjust import
describe('Auth', () => {
  it('should register', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(201);
  });
});