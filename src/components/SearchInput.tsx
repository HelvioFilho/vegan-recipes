import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { colors } from '@/styles/colors';

type SearchInputProps = {
  handleSearch: (value: string) => void;
  value?: string;
};

export function SearchInput({ handleSearch, value = '' }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleButtonPress = () => {
    handleSearch(inputValue);
  };

  return (
    <>
      <View
        testID="search-container"
        className="mx-4 my-4 w-[93%] flex-row items-center rounded-lg border border-gray-600 bg-white-100 px-2">
        <TextInput
          className="h-14 w-[88.3%] max-w-[88.3%]"
          placeholder="Buscar receita"
          value={inputValue}
          onChangeText={setInputValue}
        />
        <TouchableOpacity
          testID="search-button"
          role="button"
          accessibilityRole="button"
          className="rounded-lg bg-green-600 px-3 py-3"
          activeOpacity={0.8}
          onPress={handleButtonPress}>
          <Ionicons name="search" size={28} color={colors.white[100]} />
        </TouchableOpacity>
      </View>
    </>
  );
}
