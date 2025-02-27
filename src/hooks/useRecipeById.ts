import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

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
};

export async function fetchRecipeById(id?: string): Promise<RecipeProps> {
  if (!id) {
    throw new Error('ID da receita não foi fornecido');
  }
  const response = await api.get<RecipeProps>(`/recipes/${id}`);
  return response.data;
}

export function useRecipeById(id?: string) {
  return useQuery<RecipeProps>({
    queryKey: ['recipeById', id],
    queryFn: () => fetchRecipeById(id),
    enabled: !!id,
  });
}
