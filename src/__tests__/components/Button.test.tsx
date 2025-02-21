import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button component', () => {
  it('renders correctly with the provided title', () => {
    const { getByText } = render(<Button title="Test Button" buttonStyle="text-red-500" />);

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('applies the correct buttonStyle to the Text element', () => {
    const { getByText } = render(<Button title="Styled Button" buttonStyle="text-green-500" />);
    const textElement = getByText('Styled Button');

    expect(textElement.props.className).toBe('text-green-500');
  });

  it('calls the onPress callback when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Press Me" buttonStyle="text-blue-500" onPress={onPressMock} />
    );
    const textElement = getByText('Press Me');
    const touchableOpacity = textElement.parent;

    expect(touchableOpacity).toBeTruthy();
    fireEvent.press(touchableOpacity);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('forwards additional TouchableOpacity props', () => {
    const { getByTestId } = render(
      <Button title="Extra Prop" buttonStyle="text-yellow-500" testID="button-test" />
    );
    const touchableOpacity = getByTestId('button-test');

    expect(touchableOpacity).toBeTruthy();
  });
});
