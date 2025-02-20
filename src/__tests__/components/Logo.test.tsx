import React from 'react';
import { render } from '@testing-library/react-native';
import { Logo } from '@/components/Logo';

describe('Logo Component', () => {
  it('renders the text correctly', () => {
    const { getByText } = render(<Logo />);
    expect(getByText('Receitas Veganas')).toBeTruthy();
  });

  it('renders the logo image', () => {
    const { getByTestId } = render(<Logo />);
    const logoImage = getByTestId('logo-image');
    expect(logoImage).toBeTruthy();
  });
});
