import { FoodType, getLocalFoodTypes } from '@/services/foodTypesLocal';
import { useQuery } from '@tanstack/react-query';

export function useFoodTypes() {
  return useQuery<FoodType[], Error>({
    queryKey: ['localFoodTypes'],
    queryFn: async () => {
      const foods = await getLocalFoodTypes();
      return foods;
    },
  });
}
