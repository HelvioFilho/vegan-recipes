import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Instructions } from '@/components/Instructions';
import { Instruction } from '@/hooks/useRecipeById';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    MaterialCommunityIcons: (props: React.ComponentProps<typeof Text>) => (
      <Text {...props}>{props.name}</Text>
    ),
  };
});

jest.mock('@/assets/hat.svg', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>HatSVG</Text>;
});

describe('Instructions component', () => {
  it('renders a normal step and toggles checked state when pressed', () => {
    const instruction: Instruction = {
      id: '1',
      recipe_id: '1',
      step: 'Passo 1',
      text: 'Misture todos os ingredientes',
    };

    const { getByText, getByTestId } = render(<Instructions data={instruction} index={1} />);

    expect(getByText('1')).toBeTruthy();
    expect(getByText('Misture todos os ingredientes')).toBeTruthy();
    expect(getByText('checkbox-blank-circle-outline')).toBeTruthy();

    const pressable = getByTestId('instruction-button');
    fireEvent.press(pressable);

    expect(getByText('check-circle-outline')).toBeTruthy();
  });

  it('disables pressable and shows Hat icon when step is "Dicas extras"', () => {
    const instruction: Instruction = {
      id: '1',
      recipe_id: '1',
      step: 'Dicas extras',
      text: 'Use menos sal se preferir',
    };

    const { getByText, getByTestId, queryByText } = render(
      <Instructions data={instruction} index={1} />
    );

    expect(getByText('HatSVG')).toBeTruthy();
    expect(queryByText('1')).toBeNull();
    expect(queryByText('checkbox-blank-circle-outline')).toBeNull();
    expect(queryByText('check-circle-outline')).toBeNull();

    const pressable = getByTestId('instruction-button');
    fireEvent.press(pressable);

    expect(queryByText('check-circle-outline')).toBeNull();
  });
});
