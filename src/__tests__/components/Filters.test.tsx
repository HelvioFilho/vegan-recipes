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

  it('calls applyFilters with toggled difficulty when pressing a difficulty chip (ligar)', () => {
    const { getByText } = render(
      <Filters
        applyFilters={mockApplyFilters}
        difficulty=""
        foodType={[]}
        foodTypesData={foodTypesData}
      />
    );

    const facilChip = getByText('Fácil');
    fireEvent.press(facilChip);

    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: 'Fácil' }, { foodType: [] });
  });

  it('calls applyFilters with toggled difficulty when pressing a difficulty chip (desligar)', () => {
    const { getByText } = render(
      <Filters
        applyFilters={mockApplyFilters}
        difficulty="Fácil"
        foodType={[]}
        foodTypesData={foodTypesData}
      />
    );

    const facilChip = getByText('Fácil');
    fireEvent.press(facilChip);

    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [] });
  });

  it('calls applyFilters when a food type chip is pressed to add a type', () => {
    const { getByText } = render(
      <Filters
        applyFilters={mockApplyFilters}
        difficulty=""
        foodType={[]}
        foodTypesData={foodTypesData}
      />
    );

    const sobremesaChip = getByText('Sobremesa');
    fireEvent.press(sobremesaChip);

    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [1] });
  });

  it('calls applyFilters when a food type chip is pressed to remove a type', () => {
    const { getByText } = render(
      <Filters
        applyFilters={mockApplyFilters}
        difficulty=""
        foodType={[1, 2]}
        foodTypesData={foodTypesData}
      />
    );

    const sobremesaChip = getByText('Sobremesa');
    fireEvent.press(sobremesaChip);

    expect(mockApplyFilters).toHaveBeenLastCalledWith({ difficulty: '' }, { foodType: [2] });
  });
});
