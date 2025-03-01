import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Instruction } from '@/hooks/useRecipeById';

import { colors } from '@/styles/colors';

import Hat from '@/assets/hat.svg';

type InstructionsProps = {
  data: Instruction;
  index: number;
};

export function Instructions({ data, index }: InstructionsProps) {
  const [checked, setChecked] = useState(false);
  const isExtra = data.step === 'Dicas extras';
  return (
    <Pressable
      testID="instruction-button"
      onPress={() => setChecked(!checked)}
      disabled={isExtra}
      role="button"
      accessibilityRole="button"
      className="mb-2 flex-1 flex-row items-center rounded-md bg-white-100 p-3">
      <View className="flex-2">
        {isExtra ? (
          <Hat width={28} height={28} />
        ) : (
          <Text className={`font-bold text-3xl ${checked ? 'text-gray-500' : ' text-black-900'}`}>
            {index}
          </Text>
        )}
      </View>
      <View className="mx-4 flex-1">
        <Text
          className={`font-regular text-lg leading-7 ${checked ? 'text-gray-500 line-through' : ' text-black-900'}`}>
          {data.text}
        </Text>
      </View>
      {!isExtra && (
        <View className="flex-2 items-end">
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
      )}
    </Pressable>
  );
}
