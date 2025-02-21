import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchInput } from '@/components/SearchInput';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: React.ComponentProps<typeof Text>) => <Text {...props}>{props.name}</Text>,
  };
});

describe('SearchInput Component', () => {
  const errorMessage = 'O campo de pesquisa precisa ter pelo menos 4 caracteres';
  let handleSearchMock: jest.Mock;

  beforeEach(() => {
    handleSearchMock = jest.fn();
  });

  it('renders correctly with initial state', () => {
    const { getByPlaceholderText, queryByText } = render(
      <SearchInput handleSearch={handleSearchMock} />
    );

    expect(getByPlaceholderText('Buscar receita')).toBeTruthy();
    expect(queryByText(errorMessage)).toBeNull();
  });

  it('calls handleSearch when a valid input is provided', () => {
    const { getByPlaceholderText, getAllByRole, queryByText } = render(
      <SearchInput handleSearch={handleSearchMock} />
    );

    const input = getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'Cake');

    const buttons = getAllByRole('button');
    expect(buttons.length).toBe(1);

    fireEvent.press(buttons[0]);
    expect(handleSearchMock).toHaveBeenCalledWith('Cake');
    expect(queryByText(errorMessage)).toBeNull();
  });

  it('shows error modal and does not call handleSearch when input is invalid', () => {
    const { getByPlaceholderText, getByTestId, getAllByRole, getByText } = render(
      <SearchInput handleSearch={handleSearchMock} />
    );

    const input = getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'abc');

    const buttons = getAllByRole('button');
    fireEvent.press(buttons[0]);
    expect(handleSearchMock).not.toHaveBeenCalled();
    expect(getByText(errorMessage)).toBeTruthy();

    const container = getByTestId('search-container');
    expect(container.props.className).toContain('border-red-500');
  });

  it('removes error border when input becomes valid after an error', () => {
    const { getByPlaceholderText, getByTestId, getAllByRole } = render(
      <SearchInput handleSearch={handleSearchMock} />
    );

    const input = getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'abc');
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[0]);

    const container = getByTestId('search-container');
    expect(container.props.className).toContain('border-red-500');

    fireEvent.changeText(input, 'Cake');
    expect(container.props.className).toContain('border-gray-600');
    expect(container.props.className).not.toContain('border-red-500');
  });

  it('closes error modal when the close button is pressed', async () => {
    const { getByPlaceholderText, getAllByRole, getByText, queryByText } = render(
      <SearchInput handleSearch={handleSearchMock} />
    );

    const input = getByPlaceholderText('Buscar receita');
    fireEvent.changeText(input, 'abc');
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[0]);
    expect(getByText(errorMessage)).toBeTruthy();

    const closeButton = getByText('Fechar');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(queryByText(errorMessage)).toBeNull();
    });
  });
});
