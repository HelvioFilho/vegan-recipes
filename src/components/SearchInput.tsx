import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { AlertModal } from './AlertModal';
import { Button } from './Button';

import { colors } from '@/styles/colors';

type SearchInputProps = {
  handleSearch: (value: string) => void;
};

export function SearchInput({ handleSearch }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isValid = inputValue.length >= 4;

  const handleButtonPress = () => {
    if (!isValid) {
      setShowError(true);
      setShowModal(true);
    } else {
      handleSearch(inputValue);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.length >= 4 && showError) {
      setShowError(false);
    }
  };

  return (
    <>
      <View
        testID="search-container"
        className={`mx-4 my-4 w-[93%] flex-row items-center rounded-lg border ${
          showError ? 'border-red-500' : 'border-gray-600'
        } bg-white-100 px-2`}>
        <TextInput
          className="h-14 w-[88.3%] max-w-[88.3%]"
          placeholder="Buscar receita"
          value={inputValue}
          onChangeText={handleInputChange}
        />
        <TouchableOpacity
          role="button"
          accessibilityRole="button"
          className={`rounded-lg px-3 py-3 ${isValid ? 'bg-green-600' : 'bg-green-300'}`}
          activeOpacity={0.8}
          onPress={handleButtonPress}>
          <Ionicons name="search" size={28} color={colors.white[100]} />
        </TouchableOpacity>
      </View>
      <AlertModal
        message="O campo de pesquisa precisa ter pelo menos 4 caracteres"
        showModal={showModal}
        setShowModal={setShowModal}>
        <Button
          className="w-2/5 items-center justify-center self-center rounded-lg bg-red-900 px-3 py-2"
          buttonStyle="text-white-100 font-bold"
          title="Fechar"
          onPress={() => setShowModal(false)}
        />
      </AlertModal>
    </>
  );
}
