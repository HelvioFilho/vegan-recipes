import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { getFavoriteRecipeById } from '@/services/favoritesLocal';

export type Ingredient = {
  id: string;
  recipe_id: string;
  name: string;
  amount: string;
  section: string;
};

export type Instruction = {
  id: string;
  recipe_id: string;
  step: string;
  text: string;
};

export type FoodType = {
  id: string;
  name: string;
};

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
  observation: string | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  food_types: FoodType[];
  user_rating: number;
};

export async function fetchRecipeById(
  id?: string,
  isOffline?: boolean,
  userId?: string
): Promise<RecipeProps> {
  const IMAGE_URL = process.env.EXPO_PUBLIC_IMAGE_URL;

  if (!id) {
    throw new Error('ID da receita não foi fornecido');
  }

  const localRecipe = await getFavoriteRecipeById(id);

  if (isOffline || localRecipe) {
    if (localRecipe) {
      return localRecipe;
    }
  }

  const response = await api.get<RecipeProps>(`/recipes/${id}/${userId}`);

  return { ...response.data, cover: `${IMAGE_URL}/${response.data.cover}` };
}

export function useRecipeById(id?: string, isOffline?: boolean, userId?: string) {
  return useQuery<RecipeProps>({
    queryKey: ['recipeById', id],
    queryFn: () => fetchRecipeById(id, isOffline, userId),
    enabled: !!id,
  });
}
