import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInfiniteSearchRecipes } from '@/hooks/useSearchRecipes';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { useLocalSearchParams } from 'expo-router';
import Search from '@/app/(tabs)/search';

jest.mock('expo-router', () => {
  const mockReplace = jest.fn();
  const mockPush = jest.fn();
  return {
    useRouter: () => ({ replace: mockReplace, push: mockPush }),
    __mockReplace: mockReplace,
    __mockPush: mockPush,
    useLocalSearchParams: jest.fn(),
  };
});

jest.mock('@/components/Filters', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    Filters: ({ applyFilters }: any) => {
      return (
        <View>
          <Pressable
            testID="mock-apply-filter"
            onPress={() =>
              applyFilters({ difficulty: 'Fácil' }, { foodType: [1, 2, undefined, 3] })
            }>
            <Text>Aplicar Filtros (com foodType)</Text>
          </Pressable>
          <Pressable
            testID="mock-apply-filter-without-foodType"
            onPress={() => applyFilters({ difficulty: 'Intermediário' }, {})}>
            <Text>Aplicar Filtros (sem foodType)</Text>
          </Pressable>
        </View>
      );
    },
  };
});

jest.mock('expo-font', () => {
  const actualExpoFont = jest.requireActual('expo-font');
  return {
    ...actualExpoFont,
    isLoaded: jest.fn().mockReturnValue(true),
    loadAsync: jest.fn().mockResolvedValue(undefined),
    useFonts: jest.fn().mockReturnValue([true, null]),
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');

jest.mock('@/hooks/useFoodTypes', () => ({
  useFoodTypes: jest.fn(),
}));
jest.mock('@/hooks/useSearchRecipes', () => ({
  useInfiniteSearchRecipes: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

function renderSearch() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Search />
    </QueryClientProvider>
  );
}

describe('Search screen', () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ search: '' });
    (useFoodTypes as jest.Mock).mockReturnValue({ data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading indicator if isLoading is true', () => {
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    renderSearch();
    expect(screen.getByTestId('loading-view')).toBeTruthy();
  });

  it('should render error card if error is not null', () => {
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Simulated error'),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    renderSearch();
    expect(screen.getByText(/Ocorreu um erro inesperado/i)).toBeTruthy();
  });

  it('should render the list of recipes if data exists and no error', async () => {
    const mockData = {
      pages: [
        {
          recipes: [
            { id: '1', name: 'Recipe 1', cover: 'cover1.jpg', time: 30, total_ingredients: 5 },
            { id: '2', name: 'Recipe 2', cover: 'cover2.jpg', time: 15, total_ingredients: 3 },
          ],
        },
      ],
    };
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
    });
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText(/Recipe 1/i)).toBeTruthy();
      expect(screen.getByText(/Recipe 2/i)).toBeTruthy();
    });
  });

  it('should call fetchNextPage when onEndReached if there is next page', () => {
    const fetchNextPageMock = jest.fn();
    const mockData = {
      pages: [
        {
          recipes: [
            { id: '1', name: 'Recipe 1', cover: 'cover1.jpg', time: 30, total_ingredients: 5 },
          ],
        },
      ],
    };
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      fetchNextPage: fetchNextPageMock,
      hasNextPage: true,
      isFetchingNextPage: false,
    });
    renderSearch();
    const flatList = screen.getByTestId('recipe-flatlist');
    fireEvent(flatList, 'onEndReached');
    expect(fetchNextPageMock).toHaveBeenCalledTimes(1);
  });

  it('should NOT call fetchNextPage when onEndReached if there is no next page', () => {
    const fetchNextPageMock = jest.fn();
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: fetchNextPageMock,
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    renderSearch();
    const flatList = screen.getByTestId('recipe-flatlist');
    fireEvent(flatList, 'onEndReached');
    expect(fetchNextPageMock).not.toHaveBeenCalled();
  });

  it('should render ListEmptyComponent when no recipes and any filter is active', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ search: 'test' });
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    renderSearch();
    await waitFor(() => {
      expect(
        screen.getByText(
          /Nenhuma receita encontrada, verifique a ortografia ou altere os filtros de busca./i
        )
      ).toBeTruthy();
    });
  });

  it('should render footer loading component when isFetchingNextPage is true', () => {
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: true,
    });
    renderSearch();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  it('should call router.replace with the search value when pressing the search button', () => {
    const { __mockReplace } = require('expo-router');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ search: '' });
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    renderSearch();
    const input = screen.getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'new search');
    const button = screen.getByTestId('search-button');
    fireEvent.press(button);
    expect(__mockReplace).toHaveBeenCalledWith('/search?search=new%20search');
  });

  it('should update SearchInput value with searchParam from URL', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ search: 'updated' });
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    renderSearch();
    const input = screen.getByPlaceholderText('Buscar receita');
    expect(input.props.value).toBe('updated');
  });

  it('should update filter states when Filters child calls applyFilters', async () => {
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    renderSearch();

    const filterButton = screen.getByTestId('mock-apply-filter');
    fireEvent.press(filterButton);

    await waitFor(() => {
      const calls = (useInfiniteSearchRecipes as jest.Mock).mock.calls;
      const lastConsultArg = calls[calls.length - 1][0];

      expect(lastConsultArg).toContain('&difficulty=Fácil');
      expect(lastConsultArg).toContain('&food_types=1,2,3');
    });
  });

  it('should use else branch of handleApplyFilters when newFoodTypeFilter.foodType is falsy', async () => {
    (useInfiniteSearchRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    renderSearch();

    const filterButton = screen.getByTestId('mock-apply-filter-without-foodType');
    fireEvent.press(filterButton);

    await waitFor(() => {
      const calls = (useInfiniteSearchRecipes as jest.Mock).mock.calls;
      const lastConsultArg = calls[calls.length - 1][0];

      expect(lastConsultArg).toContain('&difficulty=Intermediário');
      expect(lastConsultArg).not.toContain('&food_types=');
    });
  });
});
