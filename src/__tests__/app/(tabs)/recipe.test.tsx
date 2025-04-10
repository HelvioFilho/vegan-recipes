import { useLocalSearchParams } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import Recipe from '@/app/(tabs)/recipe';

import { useRecipeById } from '@/hooks/useRecipeById';
import { useOfflineStore } from '@/store/offlineStore';
import { favoriteRecipe, getFavoriteRecipeById, unfavoriteRecipe } from '@/services/favoritesLocal';

jest.mock('@/hooks/useRecipeById');
jest.mock('@/store/offlineStore', () => ({
  useOfflineStore: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/services/favoritesLocal', () => ({
  getFavoriteRecipeById: jest.fn(),
  favoriteRecipe: jest.fn(),
  unfavoriteRecipe: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: React.ComponentProps<typeof Text>) => <Text {...props}>{props.name}</Text>,
    MaterialCommunityIcons: (props: React.ComponentProps<typeof Text>) => (
      <Text {...props}>{props.name}</Text>
    ),
  };
});

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
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    ErrorCard: ({ handleRefresh }: { handleRefresh?: () => void }) => (
      <View>
        <Text>An unexpected error occurred</Text>
        {handleRefresh && (
          <TouchableOpacity onPress={handleRefresh} testID="errorcard-refresh-button">
            <Text>Try Again</Text>
          </TouchableOpacity>
        )}
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
  const { Text, TouchableOpacity } = require('react-native');
  return {
    Instructions: ({ data, index, onToggle, checked }: any) => (
      <TouchableOpacity testID={`instruction-item-${index}`} onPress={onToggle}>
        <Text>
          {index}. {data.text} - {checked ? 'checked' : 'unchecked'}
        </Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/assets/kitchen.svg', () => 'KitchenSVG');
jest.mock('@/assets/pan.svg', () => 'PanSVG');
jest.mock('@/assets/list.svg', () => 'ListSVG');
jest.mock('@/assets/easy.svg', () => 'EasySVG');
jest.mock('@/assets/ingredients.svg', () => 'IngredientsSVG');
jest.mock('@/assets/fire.svg', () => 'FireSVG');
jest.mock('@/assets/time.svg', () => 'TimeSVG');

jest.mock('@/assets/hard.svg', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>HardSVG</Text>;
});

jest.mock('@/assets/medium.svg', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>MediumSVG</Text>;
});

const mockedShowToast = jest.fn();
jest.mock('@/contexts/Toast', () => ({
  useToast: () => ({ showToast: mockedShowToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/Rate', () => {
  const { View, Text, Button } = require('react-native');
  return {
    Rate: ({ visible, onClose, recipeId }: any) =>
      visible ? (
        <View testID="rate-modal">
          <Text>Rate Modal - {recipeId}</Text>
          <Button title="Close Modal" onPress={onClose} />
        </View>
      ) : null,
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderRecipe = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Recipe />
    </QueryClientProvider>
  );
};

describe('Recipe screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOffline: false,
      setIsOffline: jest.fn(),
    });
    mockedShowToast.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render loading indicator when isLoading is true', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderRecipe();
    expect(screen.getByTestId('loading-view')).toBeTruthy();
  });

  it('should render error card when there is an error', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Simulated error'),
      refetch: jest.fn(),
    });

    renderRecipe();
    expect(screen.getByText('An unexpected error occurred')).toBeTruthy();
  });

  it('should call handleRefresh (refetch) when pressing "Try Again" in error card', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    const mockRefetch = jest.fn();
    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Simulated error'),
      refetch: mockRefetch,
    });

    renderRecipe();

    fireEvent.press(screen.getByTestId('errorcard-refresh-button'));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should not break if id is empty or undefined', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(null);

    renderRecipe();
    expect(screen.queryByTestId('loading-view')).toBeNull();
    expect(screen.queryByText('An unexpected error occurred')).toBeNull();
  });

  it('should render recipe data correctly when data is available and no error', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: '123',
        name: 'Recipe Test',
        cover: '/cover.jpg',
        total_ingredients: 3,
        time: 45,
        difficulty: 'Fácil',
        calories: 200,
        food_types: [
          { id: '1', name: 'Sweet' },
          { id: '2', name: 'Snack' },
        ],
        observation: 'Testing observations',
        ingredients: [
          { id: 'ing1', name: 'Flour', section: 'Dough' },
          { id: 'ing2', name: 'Eggs', section: 'Dough' },
          { id: 'ing3', name: 'Milk', section: null },
        ],
        instructions: [
          { id: 'inst1', text: 'Mix everything', step: 'Step 1' },
          { id: 'inst2', text: 'Put in the oven', step: 'Step 2' },
          { id: 'inst3', text: 'Wait to cool down', step: 'Step 2' },
        ],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(null);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByTestId('header-title').children).toContain('Recipe Test');
    });

    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('Ingredientes')).toBeTruthy();
    expect(screen.getByText('Tempo de preparo')).toBeTruthy();
    expect(screen.getByText('45 minutos')).toBeTruthy();
    expect(screen.getByText('Fácil')).toBeTruthy();
    expect(screen.getByText('Calorias')).toBeTruthy();
    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('Sweet')).toBeTruthy();
    expect(screen.getByText('Snack')).toBeTruthy();
    expect(screen.getByText('Testing observations')).toBeTruthy();

    const ingredientItems = screen.getAllByTestId('ingredient-item');
    expect(ingredientItems).toHaveLength(3);

    const instructionItem1 = screen.getByTestId('instruction-item-1');
    const instructionItem2 = screen.getByTestId('instruction-item-2');
    const instructionItem3 = screen.getByTestId('instruction-item-3');
    expect(instructionItem1).toBeTruthy();
    expect(instructionItem2).toBeTruthy();
    expect(instructionItem3).toBeTruthy();
    expect(screen.getByText('1. Mix everything - unchecked')).toBeTruthy();
    expect(screen.getByText('2. Put in the oven - unchecked')).toBeTruthy();
    expect(screen.getByText('3. Wait to cool down - unchecked')).toBeTruthy();
  });

  it('should check instructions when pressing each step (handleToggleInstruction)', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '789' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: '789',
        name: 'Instructions Test',
        cover: '',
        total_ingredients: 0,
        time: null,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [
          { id: 'i1', text: 'Do step 1', step: 'Step 1' },
          { id: 'i2', text: 'Do step 2', step: 'Step 2' },
        ],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    fireEvent.press(screen.getByTestId('instruction-item-1'));
    await waitFor(() => {
      expect(screen.getByText('1. Do step 1 - checked')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('instruction-item-2'));
    await waitFor(() => {
      expect(screen.getByText('2. Do step 2 - checked')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('instruction-item-2'));
    await waitFor(() => {
      expect(screen.getByText('2. Do step 2 - unchecked')).toBeTruthy();
    });
  });

  it('should call checkFavorite on mount and update favorite state accordingly', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '999' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: '999',
        name: 'Some Recipe',
        cover: '/cover.jpg',
        total_ingredients: 0,
        time: 0,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(true);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('Favorite')).toBeTruthy();
    });
  });

  it('should toggle favorite state (favorite -> unfavorite -> favorite)', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ABC' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'ABC',
        name: 'Favorite Recipe',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: null,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);
    (favoriteRecipe as jest.Mock).mockResolvedValue(undefined);
    (unfavoriteRecipe as jest.Mock).mockResolvedValue(undefined);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('Not Favorite')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('favorite-button'));
    await waitFor(() => {
      expect(screen.getByText('Favorite')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('favorite-button'));
    await waitFor(() => {
      expect(screen.getByText('Not Favorite')).toBeTruthy();
    });
  });

  it('should toggle favorite state and call showToast accordingly', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ABC' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'ABC',
        name: 'Favorite Recipe',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: null,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);
    (favoriteRecipe as jest.Mock).mockResolvedValue(undefined);
    (unfavoriteRecipe as jest.Mock).mockResolvedValue(undefined);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('Not Favorite')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('favorite-button'));
    await waitFor(() => {
      expect(screen.getByText('Favorite')).toBeTruthy();
    });
    expect(mockedShowToast).toHaveBeenCalledWith('Receita adicionada aos favoritos!', 'success');

    fireEvent.press(screen.getByTestId('favorite-button'));
    await waitFor(() => {
      expect(screen.getByText('Not Favorite')).toBeTruthy();
    });
    expect(mockedShowToast).toHaveBeenCalledWith('Receita removida dos favoritos!', 'danger');
  });

  it('should do nothing if food is null when pressing favorite button', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'NO_FOOD' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('Not Favorite')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('favorite-button'));

    expect(favoriteRecipe).not.toHaveBeenCalled();
    expect(unfavoriteRecipe).not.toHaveBeenCalled();
    expect(screen.getByText('Not Favorite')).toBeTruthy();
  });

  it('should render rating stars correctly when rating is non-zero', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'rating-test' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'rating-test',
        name: 'Rating Test Recipe',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: 30,
        difficulty: 'Fácil',
        calories: 100,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 3.5,
        user_rating: 1,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('(3.5)')).toBeTruthy();
    });
    expect(screen.getByText('star-half-outline')).toBeTruthy();
  });

  it('should check instructions when pressing each step and test handleToggleInstruction', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '789' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: '789',
        name: 'Instructions Test',
        cover: '',
        total_ingredients: 0,
        time: null,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [
          { id: 'i1', text: 'Do step 1', step: 'Step 1' },
          { id: 'i2', text: 'Do step 2', step: 'Step 2' },
        ],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    fireEvent.press(screen.getByTestId('instruction-item-1'));
    await waitFor(() => {
      expect(screen.getByText('1. Do step 1 - checked')).toBeTruthy();
    });

    expect(screen.getByText('2. Do step 2 - unchecked')).toBeTruthy();

    fireEvent.press(screen.getByTestId('instruction-item-2'));
    await waitFor(() => {
      expect(screen.getByText('2. Do step 2 - checked')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('instruction-item-2'));
    await waitFor(() => {
      expect(screen.getByText('2. Do step 2 - unchecked')).toBeTruthy();
    });
  });

  it('should call useRecipeById with isOffline = true if the store says offline', () => {
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({ isOffline: true });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '456' });

    (useRecipeById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderRecipe();

    expect(useRecipeById).toHaveBeenCalledWith('456', true, null);
  });

  it('should handle error when toggling favorite (favorite -> error)', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ABC' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'ABC',
        name: 'Favorite Recipe',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: null,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    (favoriteRecipe as jest.Mock).mockRejectedValue(new Error('Failed to favorite'));

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('Not Favorite')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('favorite-button'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error toggling favorite:', expect.any(Error));
    });
  });

  it('should handle error when toggling favorite (unfavorite -> error)', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ABC' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'ABC',
        name: 'Favorite Recipe',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: null,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(true);

    (unfavoriteRecipe as jest.Mock).mockRejectedValue(new Error('Failed to unfavorite'));

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('Favorite')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('favorite-button'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error toggling favorite:', expect.any(Error));
    });
  });

  it('should render Hard icon if difficulty is "Difícil"', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });

    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: '123',
        name: 'Recipe Hard Test',
        cover: '',
        total_ingredients: 0,
        time: null,
        difficulty: 'Difícil',
        calories: null,
        rating: 0,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('HardSVG')).toBeTruthy();
    });
  });

  it('should render Medium icon if difficulty is "Intermediário"', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '456' });

    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: '456',
        name: 'Recipe Medium Test',
        cover: '',
        total_ingredients: 0,
        time: null,
        difficulty: 'Intermediário',
        calories: null,
        rating: 0,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('MediumSVG')).toBeTruthy();
    });
  });

  it('should open the Rate modal when pressing "Avaliar receita"', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'OPEN-MODAL' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'OPEN-MODAL',
        name: 'Recipe to Open Modal',
        cover: '',
        total_ingredients: 2,
        time: 15,
        difficulty: 'Fácil',
        calories: 100,
        rating: 0,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    expect(screen.queryByTestId('rate-modal')).toBeNull();

    fireEvent.press(screen.getByText('Avaliar receita'));

    await waitFor(() => {
      expect(screen.getByTestId('rate-modal')).toBeTruthy();
    });
  });

  it('should close the Rate modal when handleCloseRateModal is called', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'CLOSE-MODAL' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'OPEN-MODAL',
        name: 'Recipe to Close Modal',
        cover: '',
        total_ingredients: 2,
        time: 15,
        difficulty: 'Fácil',
        calories: 100,
        rating: 0,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    fireEvent.press(screen.getByText('Avaliar receita'));

    await waitFor(() => {
      expect(screen.getByTestId('rate-modal')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Close Modal'));

    await waitFor(() => {
      expect(screen.queryByTestId('rate-modal')).toBeNull();
    });
  });

  it('should render the user rate as "2 estrelas" when userRate > 1', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'userRateTest' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'userRateTest',
        name: 'Recipe with Rating',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: 30,
        difficulty: 'Fácil',
        calories: 100,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 4,
        user_rating: 2,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    await waitFor(() => {
      expect(screen.getByText('2 estrelas')).toBeTruthy();
    });
  });

  it('should render the evaluation button as disabled with offline style when isOffline is true', async () => {
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOffline: true,
      setIsOffline: jest.fn(),
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'offlineTest' });
    (useRecipeById as jest.Mock).mockReturnValue({
      data: {
        id: 'offlineTest',
        name: 'Offline Recipe',
        cover: '/cover.jpg',
        total_ingredients: 2,
        time: 30,
        difficulty: 'Fácil',
        calories: 100,
        food_types: [],
        observation: '',
        ingredients: [],
        instructions: [],
        rating: 0,
        user_rating: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (getFavoriteRecipeById as jest.Mock).mockResolvedValue(false);

    renderRecipe();

    const disabledPressable = screen.getByA11yState({ disabled: true });
    expect(disabledPressable).toBeTruthy();
    const { Text } = require('react-native');
    const textComponent = disabledPressable.findByType(Text);
    expect(textComponent.props.children).toBe('Avaliar receita');
  });
});
