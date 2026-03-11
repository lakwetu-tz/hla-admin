import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/features/auth/service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setAuth, logout: clearAuth, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: any) => {
      setAuth(data.user, data.accessToken);
      toast.success('Login successful', {
        description: `Welcome back, ${data.user.name}!`,
      });
      // Force immediate navigation to clear any stale state
      window.location.href = '/admin';
    },
    onError: (error: any) => {
      toast.error('Login failed', {
        description: error.response?.data?.error || 'Invalid credentials',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
      // Force immediate navigation and reload to clear all memory/cookies
      window.location.replace('/');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    user,
    isAuthenticated,
  };
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
  });
};
