import { useQuery, useQueryClient } from '@tanstack/react-query';

import { reflectionsRepository, type ReflectionFilter } from '@/repositories/reflectionsRepository';
import { useAuth } from '@/providers/AuthProvider';

export function useReflectionsList(filter: ReflectionFilter = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reflections', user?.uid, filter],
    queryFn: () => reflectionsRepository.listByFilter(user!.uid, filter),
    enabled: !!user,
  });
}

export function useReflection(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reflection', user?.uid, id],
    queryFn: () => reflectionsRepository.getById(user!.uid, id!),
    enabled: !!user && !!id,
  });
}

export function useInvalidateReflections() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['reflections', user?.uid] });
    queryClient.invalidateQueries({ queryKey: ['reflection', user?.uid] });
    queryClient.invalidateQueries({ queryKey: ['stats', user?.uid] });
  };
}
