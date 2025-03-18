import { router, useLocalSearchParams } from 'expo-router';
import { render, fireEvent } from '@testing-library/react-native';
import { Header } from '@/components/Header';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const MockedFontAwesome6 = (props: any) => {
    return <Text {...props}>FontAwesome6 icon</Text>;
  };
  MockedFontAwesome6.displayName = 'MockedFontAwesome6';

  const MockedIonicons = (props: any) => {
    return <Text {...props}>Ionicons icon</Text>;
  };
  MockedIonicons.displayName = 'MockedIonicons';

  return {
    FontAwesome6: MockedFontAwesome6,
    Ionicons: MockedIonicons,
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it('renders the title correctly', () => {
    const { getByText } = render(
      <Header title="Test Title" favorite={false} handleFavorite={jest.fn()} />
    );

    expect(getByText('Test Title')).toBeTruthy();
  });

  it('calls router.back() when the back button is pressed and no previousRoute', () => {
    const { getByLabelText } = render(
      <Header title="Sample" favorite={false} handleFavorite={jest.fn()} />
    );

    const backButton = getByLabelText('Voltar');
    fireEvent.press(backButton);

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('calls router.replace() when the back button is pressed and previousRoute is present', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ previousRoute: 'someRoute' });

    const { getByLabelText } = render(
      <Header title="Sample" favorite={false} handleFavorite={jest.fn()} />
    );

    const backButton = getByLabelText('Voltar');
    fireEvent.press(backButton);

    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/someRoute');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('displays a heart icon (filled) when favorite is true', () => {
    const { getByText } = render(
      <Header title="Sample" favorite={true} handleFavorite={jest.fn()} />
    );

    expect(getByText('Ionicons icon')).toBeTruthy();
  });

  it('displays a heart icon (outline) when favorite is false', () => {
    const { getByText } = render(
      <Header title="Sample" favorite={false} handleFavorite={jest.fn()} />
    );

    expect(getByText('Ionicons icon')).toBeTruthy();
  });

  it('calls handleFavorite when the heart button is pressed', () => {
    const mockHandleFavorite = jest.fn();
    const { getAllByRole } = render(
      <Header title="Sample" favorite={false} handleFavorite={mockHandleFavorite} />
    );

    const buttons = getAllByRole('button');
    const heartButton = buttons[1];

    fireEvent.press(heartButton);

    expect(mockHandleFavorite).toHaveBeenCalledTimes(1);
  });
});
