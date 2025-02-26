import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FilterChip } from './FilterChip';

import { FoodType } from '@/hooks/useFoodTypes';

type filterByDifficulty = {
  difficulty?: string;
};

type filterByFoodType = {
  foodType?: number[];
};

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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(difficulty);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>(foodType);

  const difficulties = ['Fácil', 'Intermediário', 'Difícil'];
  const dataFoodTypes = foodTypesData?.map((item) => {
    return {
      label: item.name,
      value: item.id,
    };
  });

  const handleSelectDifficulty = (value: string) => {
    const newDifficulty = selectedDifficulty === value ? '' : value;
    setSelectedDifficulty(newDifficulty);
    applyFilters({ difficulty: newDifficulty }, { foodType: [...selectedFoodTypes] });
  };

  const handleSelectFoodType = (value: number) => {
    let selectedFood = [];
    if (selectedFoodTypes.includes(value)) {
      setSelectedFoodTypes(selectedFoodTypes.filter((item) => item !== value));
      selectedFood = selectedFoodTypes.filter((item) => item !== value);
    } else {
      setSelectedFoodTypes([...selectedFoodTypes, value]);
      selectedFood = [...selectedFoodTypes, value];
    }
    applyFilters({ difficulty: selectedDifficulty }, { foodType: selectedFood });
  };

  return (
    <View className="px-5">
      <Text className="mb-2 font-bold text-lg">Dificuldade</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {difficulties.map((item) => (
          <FilterChip
            key={item}
            label={item}
            selected={item === selectedDifficulty}
            onPress={() => handleSelectDifficulty(item)}
          />
        ))}
      </ScrollView>
      <Text className="my-2 font-bold text-lg">Tipo de Comida</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dataFoodTypes?.map((item) => (
          <FilterChip
            key={item.label}
            label={item.label}
            selected={selectedFoodTypes.includes(item.value)}
            onPress={() => handleSelectFoodType(item.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
