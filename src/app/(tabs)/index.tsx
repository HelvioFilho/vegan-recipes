import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Logo } from '@/components/Logo';
import { ErrorCard } from '@/components/ErrorCard';
import { RecipeList } from '@/components/RecipeList';
import { SearchInput } from '@/components/SearchInput';
import { ListFooterLoading } from '@/components/ListFooterLoading';

import { useInfiniteRecipes } from '@/hooks/useInfiniteRecipes';

import { colors } from '@/styles/colors';
import { useOfflineStore } from '@/store/offlineStore';

export default function Home() {
  const { isOffline } = useOfflineStore();
  const router = useRouter();

  useEffect(() => {
    if (isOffline) {
      router.replace('/(tabs)/favorite');
    }
  }, [isOffline]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } =
    useInfiniteRecipes();

  const recipes = data?.pages.flatMap((page) => page.recipes) || [];

  const handleSearch = () => {
    router.push(`/search?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView testID="loading-view" className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.green[600]} />
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorCard handleRefresh={handleRefresh} />;
  }

  return (
    <SafeAreaView className="flex-1">
      <Logo />
      <View className="mx-1 px-3 pt-3">
        <Text className="font-bold text-2xl text-black-900">Encontre a receita</Text>
        <Text className="font-bold text-2xl text-black-900">que combina com você</Text>
      </View>
      <SearchInput handleSearch={handleSearch} value={searchQuery} setInputValue={setSearchQuery} />
      <FlatList
        testID="recipe-flatlist"
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeList data={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
