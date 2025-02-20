import { Image, Text, View } from 'react-native';
import LogoImage from '@/assets/logo.png';

export function Logo() {
  return (
    <View
      className="
      mx-3
      my-2
      flex-row
      items-center
      self-start 
      rounded-t-lg
      rounded-bl-lg
      rounded-br-[32px]
      bg-green-600
      py-2
      pl-3
      pr-5
      ">
      <Image testID="logo-image" className="h-12 w-12" source={LogoImage} />
      <Text className="pl-2 text-2xl font-bold text-white-100">Receitas Veganas</Text>
    </View>
  );
}
