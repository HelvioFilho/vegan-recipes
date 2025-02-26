import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterChip } from '@/components/FilterChip';

describe('FilterChip Component', () => {
  it('renders correctly when not selected', () => {
    const onPressMock = jest.fn();
    const { getByText, getByTestId } = render(
      <FilterChip label="Test Chip" selected={false} onPress={onPressMock} />
    );

    const chipText = getByText('Test Chip');
    expect(chipText).toBeTruthy();

    const button = getByTestId('filter-chip');
    expect(button.props.accessibilityState.selected).toBe(false);
  });

  it('renders correctly when selected', () => {
    const onPressMock = jest.fn();
    const { getByText, getByTestId } = render(
      <FilterChip label="Test Chip" selected={true} onPress={onPressMock} />
    );

    const chipText = getByText('Test Chip');
    expect(chipText).toBeTruthy();

    const button = getByTestId('filter-chip');
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <FilterChip label="Test Chip" selected={false} onPress={onPressMock} />
    );

    const button = getByTestId('filter-chip');
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
