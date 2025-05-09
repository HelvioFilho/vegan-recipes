import { Image, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RelativePathString, router } from 'expo-router';

import { RecipeProps } from '@/hooks/useInfiniteRecipes';

import formatTime from '@/utils/formatTime';

import { colors } from '@/styles/colors';

import Stars from '@/assets/stars.svg';

type RecipeListProps = {
  data: RecipeProps;
  previousRoute?: string;
  offline?: boolean;
};

const IMAGE_URL = process.env.EXPO_PUBLIC_IMAGE_URL;

export function RecipeList({ data, previousRoute = '', offline = false }: RecipeListProps) {
  const cover = offline ? data.cover : `${IMAGE_URL}${data.cover}`;

  const handleRecipe = () => {
    const url = previousRoute
      ? `/recipe?id=${data.id}&previousRoute=${previousRoute}`
      : `/recipe?id=${data.id}`;
    router.push(url as RelativePathString);
  };

  return (
    <TouchableOpacity
      className="mb-4 px-4"
      role="button"
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={handleRecipe}>
      <Image source={{ uri: cover }} className="h-64 w-full rounded-2xl" resizeMode="cover" />
      <View className="absolute bottom-1 right-5 z-50 flex-row items-center rounded-br-lg px-2 py-1">
        <Stars width={27} height={27} color={colors.yellow[500]} fill={colors.yellow[500]} />
        <Text className="ml-1 self-end font-bold text-lg text-white-100">{`${data.rating === '0.00' ? ' - ' : data.rating}`}</Text>
      </View>
      <View className="absolute bottom-0 left-0 z-50 px-7 py-3">
        <Text className="font-bold text-xl text-white-100" numberOfLines={1} ellipsizeMode="tail">
          {data.name}
        </Text>
        <View className="flex-row items-center justify-start">
          <Text className="font-regular text-lg text-white-100">
            {data.total_ingredients} ingredientes
          </Text>
          <View className="w-4 items-center justify-center">
            <Text className="font-regular text-lg text-white-100">|</Text>
          </View>
          <Text className="font-regular text-lg text-white-100">
            {formatTime(Number(data.time))}
          </Text>
        </View>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.70)', 'rgba(0, 0, 0, 0.95)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          marginHorizontal: 14,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          zIndex: 1,
          backgroundColor: 'transparent',
        }}
      />
    </TouchableOpacity>
  );
}
