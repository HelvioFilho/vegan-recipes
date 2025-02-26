import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { RecipesResponseProps } from './useInfiniteRecipes';

export function useInfiniteSearchRecipes(searchTerm: string) {
  return useInfiniteQuery<RecipesResponseProps, Error>({
    queryKey: ['searchRecipes', searchTerm],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/recipes/search?search=${searchTerm}&page=${pageParam}`);
      return response.data;
    },
    enabled: Boolean(searchTerm),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pager;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}
