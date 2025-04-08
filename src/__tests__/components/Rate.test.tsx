import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Rate } from '@/components/Rate';
import { api } from '@/services/api';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: { name: string; size?: number; color?: string }) => <Text>{props.name}</Text>,
  };
});

jest.mock('@/services/api');

const mockedShowToast = jest.fn();
jest.mock('@/contexts/Toast', () => ({
  useToast: () => ({ showToast: mockedShowToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Rate Component', () => {
  const recipeId: string = 'recipe-1';
  const userId: string = 'user-1';
  const initialRating: number = 0;

  let onCloseMock: jest.Mock;
  let setUserRateMock: jest.Mock;
  let setNewRatingMock: jest.Mock;

  beforeEach(() => {
    onCloseMock = jest.fn();
    setUserRateMock = jest.fn();
    setNewRatingMock = jest.fn();
    mockedShowToast.mockClear();
    jest.clearAllMocks();
  });

  it('should not render modal content when visible is false', () => {
    const { queryByText } = render(
      <Rate
        visible={false}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );
    expect(queryByText('Avalie a receita')).toBeNull();
  });

  it('should render modal content when visible is true', () => {
    const { getByText, getByLabelText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );
    expect(getByText('Avalie a receita')).toBeTruthy();
    expect(getByLabelText('Modal de Avaliação')).toBeTruthy();
  });

  it('should display default rating message (default to 5 when initialRating is 0)', () => {
    const { getByText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );
    expect(getByText('Excelente Receita 🤩')).toBeTruthy();
  });

  it('should update rating message when a star is pressed', () => {
    const { getByText, getByLabelText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );
    const starButton = getByLabelText('Selecionar 3 estrelas');
    fireEvent.press(starButton);
    expect(getByText('Receita Regular 🙂')).toBeTruthy();
  });

  it('should call onClose after successful submission (Enviar button)', async () => {
    const averageRating: number = 4.2;
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          recipe_id: 1,
          user_id: 1,
          rate: 5,
          average: averageRating,
        },
      },
    });

    const { getByText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );

    const submitButton = getByText('Enviar');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockedShowToast.mock.calls[0][0]).toBe('Avaliação enviada com sucesso!');
      expect(mockedShowToast.mock.calls[0][1]).toBe('success');
      expect(setNewRatingMock).toHaveBeenCalledWith(averageRating);
      expect(setUserRateMock).toHaveBeenCalledWith(5);
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('should call onClose without updating rating when submission returns non-success', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: 'error',
        data: {
          recipe_id: 1,
          user_id: 1,
          rate: 5,
          average: 3.5,
        },
      },
    });

    const { getByText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );

    const submitButton = getByText('Enviar');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockedShowToast).not.toHaveBeenCalledWith('Avaliação enviada com sucesso!', 'success');
      expect(setNewRatingMock).not.toHaveBeenCalled();
      expect(setUserRateMock).not.toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('should call onClose and show error toast if submission fails', async () => {
    const errorMessage: string = 'Network error';
    (api.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );

    const submitButton = getByText('Enviar');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockedShowToast.mock.calls[0][0]).toBe('Erro ao enviar avaliação');
      expect(mockedShowToast.mock.calls[0][1]).toBe('danger');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao enviar avaliação:', expect.any(Error));
      expect(onCloseMock).toHaveBeenCalled();
    });
    consoleErrorSpy.mockRestore();
  });

  it('should call onClose when the "Cancelar" button is pressed', () => {
    const { getByText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={initialRating}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );
    const cancelButton = getByText('Cancelar');
    fireEvent.press(cancelButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should set selectedRating to provided non-zero initialRating', () => {
    const { getByText } = render(
      <Rate
        visible={true}
        onClose={onCloseMock}
        recipeId={recipeId}
        userId={userId}
        initialRating={3}
        setUserRate={setUserRateMock}
        setNewRating={setNewRatingMock}
      />
    );
    expect(getByText('Receita Regular 🙂')).toBeTruthy();
  });
});
