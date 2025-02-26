import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Filters } from '@/components/Filters';
import { FoodType } from '@/hooks/useFoodTypes';

describe('Filters Component', () => {
  const mockApplyFilters = jest.fn();

  const foodTypesData: FoodType[] = [
    { id: 1, name: 'Sobremesa' },
    { id: 2, name: 'Doce' },
    { id: 3, name: 'Lanche' },
  ];

  beforeEach(() => {
    mockApplyFilters.mockClear();
  });

  it('renders the difficulty and food type sections with chips', () => {
    const { getByText } = render(
      <Filters applyFilters={mockApplyFilters} foodTypesData={foodTypesData} />
    );

    expect(getByText('Dificuldade')).toBeTruthy();
    expect(getByText('Tipo de Comida')).toBeTruthy();

    expect(getByText('Fácil')).toBeTruthy();
    expect(getByText('Intermediário')).toBeTruthy();
    expect(getByText('Difícil')).toBeTruthy();

    expect(getByText('Sobremesa')).toBeTruthy();
    expect(getByText('Doce')).toBeTruthy();
    expect(getByText('Lanche')).toBeTruthy();
  });

  it('calls applyFilters when a difficulty chip is pressed (toggle behavior)', () => {
    const { getByText } = render(
      <Filters applyFilters={mockApplyFilters} foodTypesData={foodTypesData} />
    );

    const difficultyChip = getByText('Fácil');

    fireEvent.press(difficultyChip);
    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: 'Fácil' }, { foodType: [] });

    fireEvent.press(difficultyChip);
    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [] });
  });

  it('calls applyFilters when a food type chip is pressed (toggle behavior)', () => {
    const { getByText } = render(
      <Filters applyFilters={mockApplyFilters} foodTypesData={foodTypesData} />
    );

    const dessertChip = getByText('Sobremesa');
    const sweetChip = getByText('Doce');

    fireEvent.press(dessertChip);
    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [1] });

    fireEvent.press(sweetChip);
    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [1, 2] });

    fireEvent.press(dessertChip);
    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [2] });
  });

  it('initializes with provided props and toggles difficulty correctly', () => {
    const { getByText } = render(
      <Filters
        applyFilters={mockApplyFilters}
        difficulty="Difícil"
        foodType={[3]}
        foodTypesData={foodTypesData}
      />
    );

    const difficultyChip = getByText('Difícil');
    fireEvent.press(difficultyChip);
    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [3] });
  });
});
