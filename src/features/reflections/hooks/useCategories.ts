import { useQuery } from '@tanstack/react-query';

import { categoriesRepository } from '@/repositories/categoriesRepository';
import { useAuth } from '@/providers/AuthProvider';

export function useCategories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categories', user?.uid],
    queryFn: () => categoriesRepository.list(user!.uid),
    enabled: !!user,
  });
}
