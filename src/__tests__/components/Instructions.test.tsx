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
  it('should render a normal (non-extra) step, display "checkbox-blank-circle-outline" icon when unchecked, and call onToggle when pressed', () => {
    const instruction: Instruction = {
      id: '1',
      recipe_id: '1',
      step: 'Passo 1',
      text: 'Misture todos os ingredientes',
    };

    const mockOnToggle = jest.fn();
    const { getByText, getByTestId } = render(
      <Instructions data={instruction} index={1} checked={false} onToggle={mockOnToggle} />
    );

    expect(getByText('1')).toBeTruthy();
    expect(getByText('Misture todos os ingredientes')).toBeTruthy();
    expect(getByText('checkbox-blank-circle-outline')).toBeTruthy();

    const pressable = getByTestId('instruction-button');
    fireEvent.press(pressable);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should render a normal (non-extra) step, display "check-circle-outline" icon when checked is true, and call onToggle when pressed', () => {
    const instruction: Instruction = {
      id: '2',
      recipe_id: '1',
      step: 'Passo 1',
      text: 'Bata a massa no liquidificador',
    };

    const mockOnToggle = jest.fn();
    const { getByText, getByTestId } = render(
      <Instructions data={instruction} index={1} checked={true} onToggle={mockOnToggle} />
    );

    expect(getByText('1')).toBeTruthy();
    expect(getByText('Bata a massa no liquidificador')).toBeTruthy();
    expect(getByText('check-circle-outline')).toBeTruthy();

    const pressable = getByTestId('instruction-button');
    fireEvent.press(pressable);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should disable the button and display HatSVG when the step is "Extra Tips", without displaying check icons', () => {
    const instruction: Instruction = {
      id: '3',
      recipe_id: '1',
      step: 'Dicas extras',
      text: 'Use menos sal se preferir',
    };

    const mockOnToggle = jest.fn();
    const { getByText, getByTestId, queryByText } = render(
      <Instructions data={instruction} index={99} checked={false} onToggle={mockOnToggle} />
    );

    expect(getByText('HatSVG')).toBeTruthy();
    expect(queryByText('1')).toBeNull();
    expect(queryByText('checkbox-blank-circle-outline')).toBeNull();
    expect(queryByText('check-circle-outline')).toBeNull();

    const pressable = getByTestId('instruction-button');
    fireEvent.press(pressable);

    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});
