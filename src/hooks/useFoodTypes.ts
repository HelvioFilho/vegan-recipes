import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export type FoodType = {
  id: number;
  name: string;
};

export function useFoodTypes() {
  return useQuery<FoodType[], Error>({
    queryKey: ['foodTypes'],
    queryFn: async () => {
      const response = await api.get('/foodtypes');
      return response.data;
    },
  });
}
