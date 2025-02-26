import React from 'react';
import { render } from '@testing-library/react-native';
import { ListFooterLoading } from '@/components/ListFooterLoading';

import { colors } from '@/styles/colors';

describe('ListFooterLoading', () => {
  it('should render ActivityIndicator with correct props and display text', () => {
    const { getByText, getByTestId } = render(<ListFooterLoading />);

    const activityIndicator = getByTestId('activity-indicator');
    expect(activityIndicator.props.size).toBe('small');
    expect(activityIndicator.props.color).toBe(colors.green[600]);

    expect(getByText('Carregando mais receitas...')).toBeTruthy();
  });
});
