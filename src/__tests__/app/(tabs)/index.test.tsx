import Home from '@/app/(tabs)/index';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useInfiniteRecipes } from '@/hooks/useInfiniteRecipes';
import { useOfflineStore } from '@/store/offlineStore';

jest.mock('expo-router', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  return {
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
    __mockPush: mockPush,
    __mockReplace: mockReplace,
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

jest.mock('@/store/offlineStore', () => ({
  useOfflineStore: jest.fn(),
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');

jest.mock('@/hooks/useInfiniteRecipes', () => ({
  useInfiniteRecipes: jest.fn(),
}));

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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function renderHome() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}

describe('Home screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({
      isOffline: false,
      setIsOffline: jest.fn(),
    });
  });

  it('should render loading indicator if isLoading is true', () => {
    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    renderHome();

    const loadingView = screen.getByTestId('loading-view');
    expect(loadingView).toBeTruthy();
  });

  it('should render error card if error is not null', () => {
    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Simulated error'),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    renderHome();

    const errorText = screen.getByText(/An unexpected error occurred/i);
    expect(errorText).toBeTruthy();
  });

  it('should render the list of recipes if data exists and not loading or error', async () => {
    const mockData = {
      pages: [
        {
          recipes: [
            { id: '1', name: 'Receita 1', cover: 'cover1.jpg', time: 30, total_ingredients: 5 },
            { id: '2', name: 'Receita 2', cover: 'cover2.jpg', time: 15, total_ingredients: 3 },
          ],
        },
      ],
    };

    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/Receita 1/i)).toBeTruthy();
      expect(screen.getByText(/Receita 2/i)).toBeTruthy();
    });
  });

  it('should call fetchNextPage when onEndReached if there is next page', () => {
    const fetchNextPageMock = jest.fn();
    const mockData = {
      pages: [
        {
          recipes: [
            { id: '1', name: 'Receita 1', cover: 'cover1.jpg', time: 30, total_ingredients: 5 },
          ],
        },
      ],
    };

    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      fetchNextPage: fetchNextPageMock,
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    const { getByTestId } = renderHome();
    const flatlist = getByTestId('recipe-flatlist');

    fireEvent(flatlist, 'onEndReached');
    expect(fetchNextPageMock).toHaveBeenCalledTimes(1);
  });

  it('should call router.push with the search value when pressing the search button', () => {
    const { __mockPush } = require('expo-router');

    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    const { getByPlaceholderText, getByTestId } = renderHome();
    const input = getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'brigadeiro');

    const button = getByTestId('search-button');
    fireEvent.press(button);

    expect(__mockPush).toHaveBeenCalledWith('/search?search=brigadeiro');
  });

  it('should NOT call fetchNextPage when onEndReached if hasNextPage is false', () => {
    const fetchNextPageMock = jest.fn();

    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: fetchNextPageMock,
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    const { getByTestId } = renderHome();
    const flatlist = getByTestId('recipe-flatlist');

    fireEvent(flatlist, 'onEndReached');

    expect(fetchNextPageMock).not.toHaveBeenCalled();
  });

  it('should render the footer loading component when isFetchingNextPage is true', () => {
    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    const { getByTestId } = renderHome();

    const loadingFooter = getByTestId('activity-indicator');
    expect(loadingFooter).toBeTruthy();
  });

  it('should redirect to the favorite screen if isOffline is true', () => {
    const { __mockReplace } = require('expo-router');
    (useOfflineStore as unknown as jest.Mock).mockReturnValue({ isOffline: true });

    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    renderHome();
    expect(__mockReplace).toHaveBeenCalledWith('/(tabs)/favorite');
  });

  it('should call refetch when the refresh button in ErrorCard is pressed', () => {
    const refetchMock = jest.fn();
    (useInfiniteRecipes as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Simulated error'),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: refetchMock,
    });

    renderHome();
    const refreshButton = screen.getByTestId('errorcard-refresh-button');
    fireEvent.press(refreshButton);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
