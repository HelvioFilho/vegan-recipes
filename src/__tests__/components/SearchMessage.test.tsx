import React from 'react';
import { render } from '@testing-library/react-native';
import { SearchMessage } from '@/components/SearchMessage';
import { FoodType } from '@/hooks/useFoodTypes';

describe('SearchMessage Component', () => {
  const foodTypesData: FoodType[] = [
    { id: 1, name: 'Sobremesa' },
    { id: 2, name: 'Doce' },
    { id: 3, name: 'Lanche' },
    { id: 4, name: 'Prato Principal' },
  ];

  it('returns null when no searchQuery and no filters are provided', () => {
    const { toJSON } = render(
      <SearchMessage searchQuery="" filterByDifficulty={{}} filterByFoodType={{}} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders header when only searchQuery is provided', () => {
    const { getByText } = render(
      <SearchMessage searchQuery="bolo" filterByDifficulty={{}} filterByFoodType={{}} />
    );
    expect(getByText('Resultados para bolo')).toBeTruthy();
  });

  it('renders header when only difficulty is provided (without searchQuery)', () => {
    const { getByText } = render(
      <SearchMessage
        searchQuery=""
        filterByDifficulty={{ difficulty: 'Fácil' }}
        filterByFoodType={{}}
      />
    );
    expect(getByText('Resultados para dificuldade: Fácil')).toBeTruthy();
  });

  it('renders header when only food type is provided (without searchQuery)', () => {
    const { getByText } = render(
      <SearchMessage
        searchQuery=""
        filterByDifficulty={{}}
        filterByFoodType={{ foodType: [3, 1] }}
        foodTypesData={foodTypesData}
      />
    );
    expect(getByText('Resultados para tipo de comida: Sobremesa, Lanche')).toBeTruthy();
  });

  it('renders header when searchQuery and difficulty are provided', () => {
    const { getByText } = render(
      <SearchMessage
        searchQuery="bolo"
        filterByDifficulty={{ difficulty: 'Fácil' }}
        filterByFoodType={{}}
      />
    );
    expect(getByText('Resultados para bolo, dificuldade: Fácil')).toBeTruthy();
  });

  it('renders header when searchQuery and food type are provided', () => {
    const { getByText } = render(
      <SearchMessage
        searchQuery="torta"
        filterByDifficulty={{}}
        filterByFoodType={{ foodType: [2, 4] }}
        foodTypesData={foodTypesData}
      />
    );
    expect(getByText('Resultados para torta, tipo de comida: Doce, Prato Principal')).toBeTruthy();
  });

  it('renders header when searchQuery, difficulty and food type are provided', () => {
    const { getByText } = render(
      <SearchMessage
        searchQuery="cookie"
        filterByDifficulty={{ difficulty: 'Intermediário' }}
        filterByFoodType={{ foodType: [4, 2, 3] }}
        foodTypesData={foodTypesData}
      />
    );
    expect(
      getByText(
        'Resultados para cookie, dificuldade: Intermediário, tipo de comida: Doce, Lanche, Prato Principal'
      )
    ).toBeTruthy();
  });

  it('renders header when only difficulty and food type are provided (without searchQuery)', () => {
    const { getByText } = render(
      <SearchMessage
        searchQuery=""
        filterByDifficulty={{ difficulty: 'Difícil' }}
        filterByFoodType={{ foodType: [4, 1] }}
        foodTypesData={foodTypesData}
      />
    );
    expect(
      getByText('Resultados para dificuldade: Difícil, tipo de comida: Sobremesa, Prato Principal')
    ).toBeTruthy();
  });

  it('renders header with food type id not found in foodTypesData', () => {
    const { getByText } = render(
      <SearchMessage
        searchQuery=""
        filterByDifficulty={{}}
        filterByFoodType={{ foodType: [99] }}
        foodTypesData={foodTypesData}
      />
    );
    expect(getByText('Resultados para tipo de comida: 99')).toBeTruthy();
  });
});
