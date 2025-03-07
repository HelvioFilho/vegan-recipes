import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useFoodTypes } from '@/hooks/useFoodTypes';
import { FoodType, getLocalFoodTypes } from '@/services/foodTypesLocal';

function createQueryClientProviderWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

jest.mock('@/services/foodTypesLocal');
const mockedGetLocalFoodTypes = getLocalFoodTypes as jest.MockedFunction<typeof getLocalFoodTypes>;

describe('useFoodTypes Hook', () => {
  const { Wrapper, queryClient } = createQueryClientProviderWrapper();

  const mockFoodTypes: FoodType[] = [
    { id: 1, name: 'Sobremesa' },
    { id: 2, name: 'Doce' },
    { id: 3, name: 'Lanche' },
  ];

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should successfully fetch and return food types', async () => {
    mockedGetLocalFoodTypes.mockResolvedValueOnce(mockFoodTypes);

    const { result, unmount } = renderHook(() => useFoodTypes(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockFoodTypes);
    expect(mockedGetLocalFoodTypes).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('should return an error when the API call fails', async () => {
    mockedGetLocalFoodTypes.mockRejectedValueOnce(new Error('API Error'));

    const { result, unmount } = renderHook(() => useFoodTypes(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    unmount();
  });
});
