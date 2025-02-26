import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { ErrorCard } from '@/components/ErrorCard';

describe('ErrorCard', () => {
  it('should render error message and email correctly', () => {
    const { getByText } = render(<ErrorCard />);

    expect(getByText('Ocorreu um erro inesperado')).toBeTruthy();
    expect(getByText('suporte@vegan-recipes.hsvf.com.br')).toBeTruthy();
    expect(getByText('4010B')).toBeTruthy();
  });

  it('should open email client when email link is pressed', () => {
    const openURLSpy = jest
      .spyOn(Linking, 'openURL')
      .mockImplementation(() => Promise.resolve(true));

    const { getByText } = render(<ErrorCard />);

    const emailLink = getByText('suporte@vegan-recipes.hsvf.com.br');
    fireEvent.press(emailLink);

    expect(openURLSpy).toHaveBeenCalledWith(
      'mailto:suporte@vegan-recipes.hsvf.com.br?subject=Erro%204010B'
    );
  });
});
