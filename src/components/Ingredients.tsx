import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Ingredient } from '@/hooks/useRecipeById';

import { colors } from '@/styles/colors';

type IngredientsProps = {
  data: Ingredient | undefined;
};

export function Ingredients({ data }: IngredientsProps) {
  const [checked, setChecked] = useState(false);

  return (
    <Pressable
      testID="ingredient-button"
      onPress={() => setChecked(!checked)}
      role="button"
      accessibilityRole="button">
      <View className="mb-2 flex-1 flex-row items-center rounded-md bg-white-100 p-3">
        <View className="flex-1 px-2">
          <Text
            className={`mr-3 font-medium text-base ${checked ? 'text-gray-500 line-through' : ' text-black-900'}`}>
            {data?.name}
          </Text>
          {data?.amount && (
            <Text
              className={`mt-1 font-regular text-base ${checked ? 'text-gray-500 line-through' : ' text-black-900'}`}>
              Quantidade: {data?.amount}
            </Text>
          )}
        </View>
        <View className="items-end">
          {checked ? (
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={24}
              color={colors.green[900]}
            />
          ) : (
            <MaterialCommunityIcons
              name="checkbox-blank-circle-outline"
              size={24}
              color={colors.black[500]}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
