import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { api } from '@/services/api';
import { useInfiniteSearchRecipes } from '@/hooks/useSearchRecipes';
import { RecipesResponseProps } from '@/hooks/useInfiniteRecipes';

function createQueryClientProviderWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

jest.mock('@/services/api');

describe('useInfiniteSearchRecipes Hook', () => {
  const { Wrapper, queryClient } = createQueryClientProviderWrapper();
  const mockedApi = api as jest.Mocked<typeof api>;
  const searchTerm = 'Cake';

  const mockSuccessPage1: RecipesResponseProps = {
    recipes: [
      {
        id: '1',
        name: 'Recipe 1',
        total_ingredients: '5',
        time: '30min',
        cover: 'cover1.png',
        video: 'video1.mp4',
        rating: '4',
        difficulty: 'easy',
        calories: '200',
      },
    ],
    pager: {
      currentPage: 1,
      totalPages: 2,
      totalItems: 2,
      perPage: 1,
    },
  };

  const mockSuccessPage2: RecipesResponseProps = {
    recipes: [
      {
        id: '2',
        name: 'Recipe 2',
        total_ingredients: '3',
        time: '45min',
        cover: 'cover2.png',
        video: 'video2.mp4',
        rating: '5',
        difficulty: 'medium',
        calories: '300',
      },
    ],
    pager: {
      currentPage: 2,
      totalPages: 2,
      totalItems: 2,
      perPage: 1,
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('must successfully search for recipes (page 1) and indicate there is a next page', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockSuccessPage1 });

    const { result, unmount } = renderHook(() => useInfiniteSearchRecipes(searchTerm), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].recipes).toHaveLength(1);
    expect(result.current.data?.pages[0].recipes[0].id).toBe('1');
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.isFetchingNextPage).toBe(false);
    unmount();
  });

  it('should use default pageParam=1 in the queryFn', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockSuccessPage1 });

    const { result, unmount } = renderHook(() => useInfiniteSearchRecipes(searchTerm), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedApi.get).toHaveBeenCalledWith(`/recipes/search?search=${searchTerm}&page=1`);
    unmount();
  });

  it('should call api.get with pageParam=2 when fetching the next page', async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: mockSuccessPage1 })
      .mockResolvedValueOnce({ data: mockSuccessPage2 });

    const { result, unmount } = renderHook(() => useInfiniteSearchRecipes(searchTerm), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedApi.get).toHaveBeenCalledWith(`/recipes/search?search=${searchTerm}&page=1`);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockedApi.get).toHaveBeenCalledWith(`/recipes/search?search=${searchTerm}&page=2`);
    unmount();
  });

  it('should not fetch a next page if currentPage equals totalPages', async () => {
    const mockSinglePage: RecipesResponseProps = {
      recipes: [
        {
          id: '1',
          name: 'Recipe 1',
          total_ingredients: '5',
          time: '30min',
          cover: 'cover1.png',
          video: 'video1.mp4',
          rating: '4',
          difficulty: 'easy',
          calories: '200',
        },
      ],
      pager: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        perPage: 1,
      },
    };

    mockedApi.get.mockResolvedValueOnce({ data: mockSinglePage });

    const { result, unmount } = renderHook(() => useInfiniteSearchRecipes(searchTerm), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(1);
    });
    unmount();
  });

  it('should return an error when the request fails', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Error when searching for recipes'));

    const { result, unmount } = renderHook(() => useInfiniteSearchRecipes(searchTerm), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    unmount();
  });

  it('should not run the query when searchTerm is empty', async () => {
    const { result, unmount } = renderHook(() => useInfiniteSearchRecipes(''), {
      wrapper: Wrapper,
    });

    expect(result.current.status).toBe('pending');
    unmount();
  });
});
