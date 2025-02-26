import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      testID="filter-chip"
      activeOpacity={0.8}
      onPress={onPress}
      className={`mr-2 rounded-3xl px-4 py-2
        ${selected ? 'bg-green-500' : 'bg-gray-200'}`}
      role="button"
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Text
        className={`text-base font-semibold
          ${selected ? 'text-white-100' : 'text-black-900'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
