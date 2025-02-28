import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchInput } from '@/components/SearchInput';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: React.ComponentProps<typeof Text>) => <Text {...props}>{props.name}</Text>,
  };
});

describe('SearchInput Component', () => {
  let handleSearchMock: jest.Mock;
  let setInputValueMock: jest.Mock;

  beforeEach(() => {
    handleSearchMock = jest.fn();
    setInputValueMock = jest.fn();
  });

  it('renders correctly with the initial value', () => {
    const { getByDisplayValue } = render(
      <SearchInput
        handleSearch={handleSearchMock}
        setInputValue={setInputValueMock}
        value="Donut"
      />
    );
    expect(getByDisplayValue('Donut')).toBeTruthy();
  });

  it('calls setInputValue when the text input changes', () => {
    const { getByPlaceholderText } = render(
      <SearchInput handleSearch={handleSearchMock} setInputValue={setInputValueMock} value="" />
    );
    const input = getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'Cake');
    expect(setInputValueMock).toHaveBeenCalledWith('Cake');
  });

  it('calls handleSearch when the search button is pressed', () => {
    const { getByTestId } = render(
      <SearchInput handleSearch={handleSearchMock} setInputValue={setInputValueMock} value="Cake" />
    );
    const button = getByTestId('search-button');
    fireEvent.press(button);
    expect(handleSearchMock).toHaveBeenCalled();
  });
});
