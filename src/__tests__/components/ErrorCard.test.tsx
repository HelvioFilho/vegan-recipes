import { Linking } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorCard } from '@/components/ErrorCard';

describe('ErrorCard', () => {
  it('should render error message and email correctly', () => {
    const dummyRefresh = jest.fn();
    const { getByText } = render(<ErrorCard handleRefresh={dummyRefresh} />);

    expect(getByText('Ocorreu um erro inesperado')).toBeTruthy();
    expect(getByText('suporte@vegan-recipes.hsvf.com.br')).toBeTruthy();
    expect(getByText('4010B')).toBeTruthy();
    expect(getByText('Tentar novamente')).toBeTruthy();
  });

  it('should open email client when email link is pressed', () => {
    const dummyRefresh = jest.fn();
    const openURLSpy = jest
      .spyOn(Linking, 'openURL')
      .mockImplementation(() => Promise.resolve(true));

    const { getByText } = render(<ErrorCard handleRefresh={dummyRefresh} />);
    const emailLink = getByText('suporte@vegan-recipes.hsvf.com.br');
    fireEvent.press(emailLink);

    expect(openURLSpy).toHaveBeenCalledWith(
      'mailto:suporte@vegan-recipes.hsvf.com.br?subject=Erro%204010B'
    );
    openURLSpy.mockRestore();
  });

  it('should call handleRefresh when the refresh button is pressed', () => {
    const dummyRefresh = jest.fn();
    const { getByText } = render(<ErrorCard handleRefresh={dummyRefresh} />);
    const refreshButton = getByText('Tentar novamente');
    fireEvent.press(refreshButton);

    expect(dummyRefresh).toHaveBeenCalledTimes(1);
  });
});
