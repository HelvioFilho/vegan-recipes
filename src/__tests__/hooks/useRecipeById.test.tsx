import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecipeById, RecipeProps, fetchRecipeById } from '@/hooks/useRecipeById';
import { api } from '@/services/api';
import { getFavoriteRecipeById } from '@/services/favoritesLocal';

jest.mock('@/services/api');
jest.mock('@/services/favoritesLocal', () => ({
  getFavoriteRecipeById: jest.fn().mockResolvedValue(null),
}));

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

describe('useRecipeById Hook', () => {
  const { Wrapper, queryClient } = createQueryClientProviderWrapper();
  const mockedApi = api as jest.Mocked<typeof api>;

  const mockRecipe: RecipeProps = {
    id: '2',
    name: 'Bifé à Milanesa',
    total_ingredients: '11',
    time: '30',
    cover: '2-bife-a-milanesa.jpg',
    video: '',
    rating: '0.00',
    difficulty: 'Intermediário',
    calories: '200-250 Kcal',
    observation: null,
    ingredients: [
      {
        id: '9',
        recipe_id: '2',
        name: 'Proteína de soja texturizada miúda',
        amount: '2 xícaras',
        section: 'Para os bifés',
      },
    ],
    instructions: [
      {
        id: '11',
        recipe_id: '2',
        step: 'Preparo da proteína de soja',
        text: 'Hidrate a proteína de soja em água morna por 5-10 minutos.',
      },
    ],
    food_types: [
      { id: '3', name: 'Lanche' },
      { id: '4', name: 'Prato Principal' },
      { id: '8', name: 'Snack' },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should successfully fetch a recipe by ID', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockRecipe });

    const { result, unmount } = renderHook(() => useRecipeById('2'), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const expectedRecipe = { ...mockRecipe, cover: 'undefined/2-bife-a-milanesa.jpg' };

    expect(result.current.data).toEqual(expectedRecipe);
    expect(mockedApi.get).toHaveBeenCalledWith('/recipes/2');
    unmount();
  });

  it('should return localRecipe if getFavoriteRecipeById returns a recipe regardless of isOffline flag', async () => {
    const fakeLocalRecipe: RecipeProps = {
      id: '2',
      name: 'Local Recipe',
      total_ingredients: '5',
      time: '20',
      cover: 'local-cover.jpg',
      video: '',
      rating: '4.0',
      difficulty: 'Easy',
      calories: '150',
      observation: null,
      ingredients: [],
      instructions: [],
      food_types: [],
    };

    (getFavoriteRecipeById as jest.Mock).mockResolvedValueOnce(fakeLocalRecipe);

    const result1 = await fetchRecipeById('2', true);

    expect(result1).toEqual(fakeLocalRecipe);

    (getFavoriteRecipeById as jest.Mock).mockResolvedValueOnce(fakeLocalRecipe);
    const result2 = await fetchRecipeById('2', false);

    expect(result2).toEqual(fakeLocalRecipe);
  });

  it('should remain pending when the ID is not provided', async () => {
    const { result, unmount } = renderHook(() => useRecipeById(undefined), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('pending');
    });

    unmount();
  });

  it('should return an error when the API call fails', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('API Error'));

    const { result, unmount } = renderHook(() => useRecipeById('2'), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    unmount();
  });
  it('should throw an error when ID is not provided', async () => {
    await expect(fetchRecipeById(undefined)).rejects.toThrow('ID da receita não foi fornecido');
  });

  it('should fetch from API if isOffline is true but localRecipe is null', async () => {
    (getFavoriteRecipeById as jest.Mock).mockResolvedValueOnce(null);

    const apiRecipe: RecipeProps = {
      id: '99',
      name: 'Offline but no local recipe',
      total_ingredients: '3',
      time: '25',
      cover: 'image.jpg',
      video: '',
      rating: '5.0',
      difficulty: 'Easy',
      calories: '100',
      observation: null,
      ingredients: [],
      instructions: [],
      food_types: [],
    };
    (api.get as jest.Mock).mockResolvedValueOnce({ data: apiRecipe });

    const result = await fetchRecipeById('99', true);

    expect(api.get).toHaveBeenCalledWith('/recipes/99');
    expect(result).toEqual({
      ...apiRecipe,
      cover: `undefined/${apiRecipe.cover}`,
    });
  });
});
