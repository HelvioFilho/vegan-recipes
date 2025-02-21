import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  buttonStyle: string;
};

export function Button({ title, buttonStyle, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity {...rest}>
      <Text className={buttonStyle}>{title}</Text>
    </TouchableOpacity>
  );
}
