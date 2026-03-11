export type Role = 'super_admin' | 'event_manager' | 'finance_manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[]; // Backend sends an array of strings
  role?: Role;     // For legacy compatibility
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}
