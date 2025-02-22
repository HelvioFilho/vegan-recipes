import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecipeList, RecipeProps } from '@/components/RecipeList';
import { router } from 'expo-router';

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
  const mockRecipe: RecipeProps = {
    id: '123',
    name: 'Mock Recipe',
    total_ingredients: '5',
    time: 10,
    cover: 'https://example.com/image.jpg',
    video: 'https://example.com/video.mp4',
  };

  it('renders the recipe data correctly', () => {
    const { getByText } = render(<RecipeList data={mockRecipe} />);

    expect(getByText('Mock Recipe')).toBeTruthy();
    expect(getByText('5 ingredientes')).toBeTruthy();
    expect(getByText('10 minutos')).toBeTruthy();
  });

  it('navigates to the correct route with the correct data when pressed', () => {
    const { getByRole } = render(<RecipeList data={mockRecipe} />);
    const button = getByRole('button');
    fireEvent.press(button);
    expect(router.push).toHaveBeenCalledTimes(1);

    const stringifiedData = JSON.stringify(mockRecipe);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/recipe/',
      params: { data: stringifiedData },
    });
  });
});
