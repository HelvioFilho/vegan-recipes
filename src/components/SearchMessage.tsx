import { FoodType } from '@/hooks/useFoodTypes';
import { Text, View } from 'react-native';

type SearchMessageProps = {
  searchQuery: string | string[];
  filterByDifficulty: { difficulty?: string };
  filterByFoodType: { foodType?: number[] };
  foodTypesData?: FoodType[];
};

export function SearchMessage({
  searchQuery,
  filterByDifficulty,
  filterByFoodType,
  foodTypesData,
}: SearchMessageProps) {
  const getHeaderMessage = () => {
    const parts: string[] = [];

    if (searchQuery && (searchQuery as string).trim().length > 0) {
      parts.push(`para ${searchQuery}`);
    }

    const filterParts: string[] = [];
    if (filterByDifficulty.difficulty) {
      filterParts.push(
        `${searchQuery ? '' : 'para '}dificuldade: ${filterByDifficulty.difficulty}`
      );
    }

    if (
      filterByFoodType.foodType &&
      filterByFoodType.foodType.length > 0 &&
      foodTypesData &&
      foodTypesData.length > 0
    ) {
      const to = searchQuery ? '' : filterByDifficulty.difficulty ? '' : 'para ';
      const sortedFoodTypeIds = [...filterByFoodType.foodType].sort(
        (itemA, itemB) => itemA - itemB
      );
      const foodTypeNames = sortedFoodTypeIds.map((foodTypeId) => {
        const found = foodTypesData.find((foodType) => foodType.id === foodTypeId);
        return found ? found.name : foodTypeId;
      });
      filterParts.push(`${to}tipo de comida: ${foodTypeNames.join(', ')}`);
    }

    if (filterParts.length > 0) {
      parts.push(`${filterParts.join(', ')}`);
    }

    if (parts.length > 0) {
      return `Resultados ${parts.join(', ')}`;
    }

    return null;
  };

  const headerMessage = getHeaderMessage();
  if (headerMessage) {
    return (
      <View className="items-center justify-center px-6 pb-2">
        <Text className="font-regular text-base">{headerMessage}</Text>
      </View>
    );
  }
  return null;
}
