import { useQuery } from '@tanstack/react-query';

import { statsService } from '@/services/statsService';
import { useAuth } from '@/providers/AuthProvider';

export function useWeeklyStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stats', user?.uid, 'weekly'],
    queryFn: () => statsService.getWeeklyStats(user!.uid),
    enabled: !!user,
  });
}
