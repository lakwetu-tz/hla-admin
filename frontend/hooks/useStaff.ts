import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { CreateStaffDTO, StaffMember } from '@/types/user';
import { toast } from 'sonner';

export const useStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: userService.getStaff,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createStaff,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(`Staff member created successfully! Temp Password: ${data.tempPassword}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create staff member');
    }
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStaffDTO> }) =>
      userService.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update staff member');
    }
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member removed successfully');
    },
    onError: () => {
      toast.error('Failed to delete staff member');
    }
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: userService.getAuditLogs,
    refetchInterval: 30000,
  });
};
