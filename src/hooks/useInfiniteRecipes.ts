import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export type RecipeProps = {
  id: string;
  name: string;
  total_ingredients: string;
  time: string;
  cover: string;
  video: string;
  rating: string;
  difficulty: string;
  calories: string;
};

export type RecipesResponseProps = {
  recipes: RecipeProps[];
  pager: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
};

export function useInfiniteRecipes() {
  return useInfiniteQuery<RecipesResponseProps, Error>({
    queryKey: ['recipes'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/recipes?page=${pageParam}`);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pager;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}
