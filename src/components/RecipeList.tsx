import { Image, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RelativePathString, router } from 'expo-router';

export type RecipeProps = {
  id: string;
  name: string;
  total_ingredients: string;
  time: number;
  cover: string;
  video: string;
};

type RecipeListProps = {
  data: RecipeProps;
};

export function RecipeList({ data }: RecipeListProps) {
  const handleRecipe = () => {
    const receive = JSON.stringify(data);

    router.push({
      pathname: `/recipe/` as RelativePathString,
      params: { data: receive },
    });
  };

  return (
    <TouchableOpacity
      className="mb-4 px-4"
      role="button"
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={handleRecipe}>
      <Image source={{ uri: data.cover }} className="h-60 w-full rounded-2xl" resizeMode="cover" />
      <View className="absolute bottom-0 left-0 z-50 px-7 py-3">
        <Text className="font-bold text-xl text-white-100">{data.name}</Text>
        <View className="flex-row items-center justify-start">
          <Text className="font-regular text-lg text-white-100">
            {data.total_ingredients} ingredientes
          </Text>
          <View className="w-4 items-center justify-center">
            <Text className="font-regular text-lg text-white-100">|</Text>
          </View>
          <Text className="font-regular text-lg text-white-100">{data.time} minutos</Text>
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
