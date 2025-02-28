import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Ingredients } from '@/components/Ingredients';
import { Ingredient } from '@/hooks/useRecipeById';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    MaterialCommunityIcons: (props: React.ComponentProps<typeof Text>) => (
      <Text {...props}>{props.name}</Text>
    ),
  };
});

describe('Ingredients component', () => {
  it('renders ingredient name and amount when provided', () => {
    const ingredient: Ingredient = {
      name: 'Tomato',
      amount: '2',
      recipe_id: '1',
      id: '1',
      section: 'Geral',
    };

    const { getByText } = render(<Ingredients data={ingredient} />);

    expect(getByText('Tomato')).toBeTruthy();
    expect(getByText('Quantidade: 2')).toBeTruthy();
    expect(getByText('checkbox-blank-circle-outline')).toBeTruthy();
  });

  it('does not crash if data is undefined', () => {
    const { queryByText } = render(<Ingredients data={undefined} />);
    expect(queryByText(/Quantidade:/)).toBeNull();
  });

  it('toggles checked state when pressed', () => {
    const ingredient: Ingredient = {
      name: 'Tomato',
      amount: '2',
      recipe_id: '1',
      id: '1',
      section: 'Geral',
    };

    const { getByText, getByTestId } = render(<Ingredients data={ingredient} />);

    expect(getByText('checkbox-blank-circle-outline')).toBeTruthy();

    const pressable = getByTestId('ingredient-button');
    fireEvent.press(pressable);

    expect(getByText('check-circle-outline')).toBeTruthy();
  });
});
