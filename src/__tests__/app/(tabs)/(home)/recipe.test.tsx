import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Recipe from '@/app/(tabs)/(home)/recipe';
import { useRecipeById } from '@/hooks/useRecipeById';
import { useLocalSearchParams } from 'expo-router';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: React.ComponentProps<typeof Text>) => <Text {...props}>{props.name}</Text>,
  };
});

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/hooks/useRecipeById', () => ({
  useRecipeById: jest.fn(),
}));

jest.mock('@/components/Header', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Header: ({ title, handleFavorite, favorite }: any) => (
      <View>
        <Text testID="header-title">{title}</Text>
        <TouchableOpacity onPress={handleFavorite} testID="favorite-button">
          <Text>{favorite ? 'Favorite' : 'Not Favorite'}</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

jest.mock('@/components/ErrorCard', () => {
  const { View, Text } = require('react-native');
  return {
    ErrorCard: () => (
      <View>
        <Text>An unexpected error occurred</Text>
      </View>
    ),
  };
});

jest.mock('@/components/Ingredients', () => {
  const { View, Text } = require('react-native');
  return {
    Ingredients: ({ data }: any) => (
      <View testID="ingredient-item">
        <Text>{data.name}</Text>
      </View>
    ),
  };
});

jest.mock('@/components/Instructions', () => {
  const { View, Text } = require('react-native');
  return {
    Instructions: ({ data, index }: any) => (
      <View testID="instruction-item">
        <Text>
          {index}. {data.text}
        </Text>
      </View>
    ),
  };
});

jest.mock('@/assets/kitchen.svg', () => 'KitchenSVG');
jest.mock('@/assets/pan.svg', () => 'PanSVG');
jest.mock('@/assets/list.svg', () => 'ListSVG');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

function renderRecipe() {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <Recipe />
    </QueryClientProvider>
  );
}

describe('Recipe screen', () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the loading indicator when isLoading is true', () => {
    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderRecipe();
    expect(screen.getByTestId('loading-view')).toBeTruthy();
  });

  it('renders the error card when there is an error', () => {
    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Simulated error'),
    });

    renderRecipe();
    expect(screen.getByText(/An unexpected error occurred/i)).toBeTruthy();
  });

  it('renders the recipe data correctly when data is available and no error', async () => {
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        name: 'Receita de Teste',
        cover: '/cover.jpg',
        total_ingredients: 3,
        time: 45,
        food_types: [
          { id: '1', name: 'Doce' },
          { id: '2', name: 'Snack' },
        ],
        observation: 'Observação de teste',
        ingredients: [
          { id: '1', name: 'Farinha', section: 'Massa' },
          { id: '2', name: 'Ovos', section: 'Massa' },
          { id: '3', name: 'Leite', section: null },
        ],
        instructions: [
          { id: '1', text: 'Misture todos os ingredientes', step: 'Passo 1' },
          { id: '2', text: 'Coloque no forno', step: 'Passo 2' },
          { id: '3', text: 'Aguarde esfriar', step: 'Passo 2' },
        ],
      },
      isLoading: false,
      error: null,
    });

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByTestId('header-title').children).toContain('Receita de Teste');
    });

    expect(screen.getByText('3 ingredientes')).toBeTruthy();
    expect(screen.getByText('Tempo de preparo: 45 minutos')).toBeTruthy();

    expect(screen.getByTestId('food-type-1')).toBeTruthy();
    expect(screen.getByTestId('food-type-2')).toBeTruthy();

    expect(screen.getByText('Observação de teste')).toBeTruthy();

    const ingredientItems = screen.getAllByTestId('ingredient-item');
    expect(ingredientItems).toHaveLength(3);

    const instructionItems = screen.getAllByTestId('instruction-item');
    expect(instructionItems).toHaveLength(3);

    // Checking the global instruction order
    expect(screen.getByText(/1\. Misture todos os ingredientes/i)).toBeTruthy();
    expect(screen.getByText(/2\. Coloque no forno/i)).toBeTruthy();
    expect(screen.getByText(/3\. Aguarde esfriar/i)).toBeTruthy();
  });

  it('toggles favorite state when pressing the favorite button', async () => {
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        name: 'Favorite Recipe',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: null,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
      },
      isLoading: false,
      error: null,
    });

    renderRecipe();

    expect(screen.getByText('Not Favorite')).toBeTruthy();

    fireEvent.press(screen.getByTestId('favorite-button'));
    await waitFor(() => {
      expect(screen.getByText('Favorite')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('favorite-button'));
    await waitFor(() => {
      expect(screen.getByText('Not Favorite')).toBeTruthy();
    });
  });
});
