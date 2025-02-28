import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { colors } from '@/styles/colors';

type SearchInputProps = {
  handleSearch: () => void;
  value: string;
  setInputValue: (value: string) => void;
};

export function SearchInput({ handleSearch, setInputValue, value }: SearchInputProps) {
  return (
    <>
      <View
        testID="search-container"
        className="mx-4 my-4 w-[93%] flex-row items-center rounded-lg border border-gray-600 bg-white-100 px-2">
        <TextInput
          className="h-14 w-[88.3%] max-w-[88.3%]"
          placeholder="Buscar receita"
          value={value}
          onChangeText={setInputValue}
        />
        <TouchableOpacity
          testID="search-button"
          role="button"
          accessibilityRole="button"
          className="rounded-lg bg-green-600 px-3 py-3"
          activeOpacity={0.8}
          onPress={handleSearch}>
          <Ionicons name="search" size={28} color={colors.white[100]} />
        </TouchableOpacity>
      </View>
    </>
  );
}
