import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

  beforeEach(() => {
    handleSearchMock = jest.fn();
  });

  it('renders correctly with initial state', () => {
    const { getByPlaceholderText } = render(<SearchInput handleSearch={handleSearchMock} />);
    expect(getByPlaceholderText('Buscar receita')).toBeTruthy();
  });

  it('calls handleSearch when button is pressed with the current input value', () => {
    const { getByPlaceholderText, getByRole } = render(
      <SearchInput handleSearch={handleSearchMock} />
    );
    const input = getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'Cake');
    const button = getByRole('button');
    fireEvent.press(button);
    expect(handleSearchMock).toHaveBeenCalledWith('Cake');
  });

  it('renders with the initial value passed as prop', () => {
    const { getByDisplayValue } = render(
      <SearchInput handleSearch={handleSearchMock} value="Donut" />
    );
    expect(getByDisplayValue('Donut')).toBeTruthy();
  });
});
