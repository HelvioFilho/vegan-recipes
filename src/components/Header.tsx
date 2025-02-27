import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';

import { colors } from '@/styles/colors';

type HeaderProps = {
  title: string;
  favorite: boolean;
  handleFavorite: () => void;
};

export function Header({ title, favorite, handleFavorite }: HeaderProps) {
  const handleBackPage = () => {
    router.back();
  };

  return (
    <View className="w-full flex-row items-center justify-between px-3">
      <Pressable
        className="h-14 w-14 items-center justify-center"
        onPress={handleBackPage}
        role="button"
        accessibilityRole="button"
        accessibilityLabel="Voltar">
        <FontAwesome6 name="arrow-left" size={26} color={colors.black[900]} />
      </Pressable>
      <View className="mx-2 flex-1">
        <Text className="font-bold text-2xl" numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <Pressable
        className="h-14 w-14 items-center justify-center"
        onPress={handleFavorite}
        role="button"
        accessibilityRole="button">
        {favorite ? (
          <Ionicons className="-mb-2" name="heart" size={26} color={colors.red[900]} />
        ) : (
          <Ionicons className="-mb-2" name="heart-outline" size={26} color={colors.red[900]} />
        )}
      </Pressable>
    </View>
  );
}
