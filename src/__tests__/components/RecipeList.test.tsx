import { router } from 'expo-router';
import { render, fireEvent } from '@testing-library/react-native';
import { RecipeList } from '@/components/RecipeList';
import { RecipeProps } from '@/hooks/useInfiniteRecipes';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: (props: any) => {
    return <>{props.children}</>;
  },
}));

describe('RecipeList component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRecipe: RecipeProps = {
    id: '123',
    name: 'Mock Recipe',
    total_ingredients: '5',
    time: '10',
    cover: 'https://example.com/image.jpg',
    video: 'https://youtube.com/watch?v=123',
    rating: '5',
    difficulty: 'Fácil',
    calories: '100 kcal',
  };

  it('should render the recipe data correctly', () => {
    const { getByText } = render(<RecipeList data={mockRecipe} />);

    expect(getByText('Mock Recipe')).toBeTruthy();
    expect(getByText('5 ingredientes')).toBeTruthy();
    expect(getByText('10 minutos')).toBeTruthy();
  });

  it('should navigate to the correct route when pressed', () => {
    const { getByRole } = render(<RecipeList data={mockRecipe} />);
    const button = getByRole('button');
    fireEvent.press(button);
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith(`/recipe?id=${mockRecipe.id}`);
  });

  it('should navigate with previousRoute when it is provided', () => {
    const { getByRole } = render(<RecipeList data={mockRecipe} previousRoute="some-route" />);
    const button = getByRole('button');
    fireEvent.press(button);

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/recipe?id=123&previousRoute=some-route');
  });
});
