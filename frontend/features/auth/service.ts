import api from '@/services/api';
import { User } from '@/types/auth';

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<{ user: User; accessToken: string }> {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Expected { accessToken, user }
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refresh(): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};
