import { View, Text, ScrollView } from 'react-native';
import { FilterChip } from './FilterChip';

import { FoodType } from '@/hooks/useFoodTypes';

type filterByDifficulty = { difficulty?: string };
type filterByFoodType = { foodType?: number[] };

type FiltersProps = {
  applyFilters: (
    newDifficultyFilter: filterByDifficulty,
    newFoodTypeFilter: filterByFoodType
  ) => void;
  difficulty?: string;
  foodType?: number[];
  foodTypesData?: FoodType[];
};

export function Filters({
  applyFilters,
  difficulty = '',
  foodType = [],
  foodTypesData,
}: FiltersProps) {
  const difficulties = ['Fácil', 'Intermediário', 'Difícil'];

  const dataFoodTypes = foodTypesData?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  function handleSelectDifficulty(value: string) {
    const newDifficulty = value === difficulty ? '' : value;
    applyFilters({ difficulty: newDifficulty }, { foodType: [...foodType] });
  }

  function handleSelectFoodType(value: number) {
    let newFoodTypes = [...foodType];
    if (newFoodTypes.includes(value)) {
      newFoodTypes = newFoodTypes.filter((item) => item !== value);
    } else {
      newFoodTypes.push(value);
    }
    applyFilters({ difficulty }, { foodType: newFoodTypes });
  }

  return (
    <View className="px-5">
      <Text className="mb-2 font-bold text-lg">Dificuldade</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {difficulties.map((item) => (
          <FilterChip
            key={item}
            label={item}
            selected={item === difficulty}
            onPress={() => handleSelectDifficulty(item)}
          />
        ))}
      </ScrollView>
      <Text className="my-2 font-bold text-lg">Tipo de Comida</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dataFoodTypes?.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            selected={foodType.includes(item.value)}
            onPress={() => handleSelectFoodType(item.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
