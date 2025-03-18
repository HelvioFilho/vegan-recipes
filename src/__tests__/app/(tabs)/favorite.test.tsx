import { useFocusEffect } from 'expo-router';
import { render, screen, waitFor } from '@testing-library/react-native';
import Favorite from '@/app/(tabs)/favorite';
import { getAllFavoriteRecipes, FavoriteListItem } from '@/services/favoritesLocal';

jest.mock('@/services/favoritesLocal', () => ({
  getAllFavoriteRecipes: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

describe('Favorite screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useFocusEffect as jest.Mock).mockImplementation((callback: () => void) => {
      callback();
    });
  });

  it('should render loading indicator when fetching favorites', async () => {
    (getAllFavoriteRecipes as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Favorite />);

    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  it('should render empty list message when no favorites are found', async () => {
    (getAllFavoriteRecipes as jest.Mock).mockResolvedValue([]);

    render(<Favorite />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Nenhuma receita encontrada, após favoritar uma receita ela aparecerá aqui.'
        )
      ).toBeTruthy();
    });
  });

  it('should render a list of favorite recipes when data is available', async () => {
    const mockData: FavoriteListItem[] = [
      {
        id: '1',
        name: 'Favorite #1',
        total_ingredients: '3',
        time: '15',
        cover: 'cover1.jpg',
        rating: '5',
        difficulty: 'Fácil',
        video: 'video1.mp4',
        calories: '100',
      },
      {
        id: '2',
        name: 'Favorite #2',
        total_ingredients: '2',
        time: '10',
        cover: 'cover2.jpg',
        rating: '4',
        difficulty: 'Médio',
        video: 'video2.mp4',
        calories: '200',
      },
    ];
    (getAllFavoriteRecipes as jest.Mock).mockResolvedValue(mockData);

    render(<Favorite />);

    await waitFor(() => {
      expect(screen.getByTestId('recipe-flatlist')).toBeTruthy();
    });

    expect(screen.getByText('Favorite #1')).toBeTruthy();
    expect(screen.getByText('Favorite #2')).toBeTruthy();
  });

  it('should log an error if fetching favorites fails', async () => {
    (getAllFavoriteRecipes as jest.Mock).mockRejectedValue(new Error('Database error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Favorite />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching favorite recipes',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
