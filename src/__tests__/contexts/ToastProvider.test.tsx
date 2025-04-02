import React from 'react';
import { Button } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ToastProvider } from '@/contexts/Toast/ToastProvider';
import { useToast } from '@/contexts/Toast/useToast';
import { colors } from '@/styles/colors';

describe('ToastProvider and useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render toast with default success variant when showToast is called without a second parameter', async () => {
    const DummySuccessDefault = () => {
      const { showToast } = useToast();
      return (
        <Button
          title="Trigger Default Success Toast"
          onPress={() => showToast('Success message')}
        />
      );
    };

    const { getByText, queryByText, getByTestId } = render(
      <ToastProvider>
        <DummySuccessDefault />
      </ToastProvider>
    );

    expect(queryByText('Success message')).toBeNull();

    await act(async () => {
      fireEvent.press(getByText('Trigger Default Success Toast'));
    });

    const toastMessage = await waitFor(() => getByText('Success message'));
    expect(toastMessage).toBeTruthy();

    const toastContainer = getByTestId('toast-container');
    expect(toastContainer.props.style).toMatchObject({
      backgroundColor: colors.green[600],
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(queryByText('Success message')).toBeNull();
    });
  });

  it('should render toast with success variant when showToast is called and remove it after timeout', async () => {
    const DummySuccess = () => {
      const { showToast } = useToast();
      return (
        <Button
          title="Trigger Success Toast"
          onPress={() => showToast('Success message', 'success')}
        />
      );
    };

    const { getByText, queryByText, getByTestId } = render(
      <ToastProvider>
        <DummySuccess />
      </ToastProvider>
    );

    expect(queryByText('Success message')).toBeNull();

    await act(async () => {
      fireEvent.press(getByText('Trigger Success Toast'));
    });

    const toastMessage = await waitFor(() => getByText('Success message'));
    expect(toastMessage).toBeTruthy();

    const toastContainer = getByTestId('toast-container');
    expect(toastContainer.props.style).toMatchObject({ backgroundColor: colors.green[600] });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(queryByText('Success message')).toBeNull();
    });
  });

  it('should render toast with danger variant when showToast is called and remove it after timeout', async () => {
    const DummyDanger = () => {
      const { showToast } = useToast();
      return (
        <Button
          title="Trigger Danger Toast"
          onPress={() => showToast('Danger message', 'danger')}
        />
      );
    };

    const { getByText, queryByText, getByTestId } = render(
      <ToastProvider>
        <DummyDanger />
      </ToastProvider>
    );

    expect(queryByText('Danger message')).toBeNull();

    await act(async () => {
      fireEvent.press(getByText('Trigger Danger Toast'));
    });

    const toastMessage = await waitFor(() => getByText('Danger message'));
    expect(toastMessage).toBeTruthy();

    const toastContainer = getByTestId('toast-container');
    expect(toastContainer.props.style).toMatchObject({ backgroundColor: colors.red[900] });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(queryByText('Danger message')).toBeNull();
    });
  });

  it('should render toast with warning variant when showToast is called and remove it after timeout', async () => {
    const DummyWarning = () => {
      const { showToast } = useToast();
      return (
        <Button
          title="Trigger Warning Toast"
          onPress={() => showToast('Warning message', 'warning')}
        />
      );
    };

    const { getByText, queryByText, getByTestId } = render(
      <ToastProvider>
        <DummyWarning />
      </ToastProvider>
    );

    expect(queryByText('Warning message')).toBeNull();

    await act(async () => {
      fireEvent.press(getByText('Trigger Warning Toast'));
    });

    const toastMessage = await waitFor(() => getByText('Warning message'));
    expect(toastMessage).toBeTruthy();

    const toastContainer = getByTestId('toast-container');
    expect(toastContainer.props.style).toMatchObject({ backgroundColor: colors.yellow[500] });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(queryByText('Warning message')).toBeNull();
    });
  });

  it('should throw error when useToast is used outside of ToastProvider', () => {
    const consoleError = console.error;
    console.error = jest.fn();

    const DummyComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<DummyComponent />)).toThrow(
      'useToast deve ser usado dentro de um <ToastProvider>'
    );

    console.error = consoleError;
  });
});
