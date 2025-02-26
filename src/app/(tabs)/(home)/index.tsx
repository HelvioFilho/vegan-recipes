import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Logo } from '@/components/Logo';
import { ErrorCard } from '@/components/ErrorCard';
import { RecipeList } from '@/components/RecipeList';
import { SearchInput } from '@/components/SearchInput';
import { ListFooterLoading } from '@/components/ListFooterLoading';

import { useInfiniteRecipes } from '@/hooks/useInfiniteRecipes';

import { colors } from '@/styles/colors';

export default function Home() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteRecipes();

  const recipes = data?.pages.flatMap((page) => page.recipes) || [];

  const router = useRouter();

  const handleSearch = (value: string) => {
    router.push(`/search?search=${encodeURIComponent(value)}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView testID="loading-view" className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.green[600]} />
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorCard />;
  }

  return (
    <SafeAreaView className="flex-1">
      <Logo />
      <View className="mx-1 px-3 pt-3">
        <Text className="font-bold text-2xl text-black-900">Encontre a receita</Text>
        <Text className="font-bold text-2xl text-black-900">que combina com você</Text>
      </View>
      <SearchInput handleSearch={handleSearch} />
      <FlatList
        testID="recipe-flatlist"
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeList data={item} />}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ListFooterLoading /> : null}
      />
    </SafeAreaView>
  );
}
