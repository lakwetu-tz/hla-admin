import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/src/features/auth/service';
import { useAuthStore } from '@/src/store/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setAuth, logout: clearAuth, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
      toast.success('Login successful', {
        description: `Welcome back, ${data.user.name}!`,
      });
      router.push('/admin');
    },
    onError: (error: any) => {
      toast.error('Login failed', {
        description: error.response?.data?.message || 'Invalid credentials',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/');
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
