import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, Text, View } from 'react-native';

import { RecipeList } from '@/components/RecipeList';

import { FavoriteListItem, getAllFavoriteRecipes } from '@/services/favoritesLocal';

import { colors } from '@/styles/colors';

import RecipeImage from '@/assets/recipes.png';

export default function favorite() {
  const [recipes, setRecipes] = useState<FavoriteListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const data: FavoriteListItem[] = await getAllFavoriteRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching favorite recipes', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );
  return (
    <SafeAreaView className="flex-1">
      <View className="items-center justify-center p-6">
        <Text className="text-2xl">Suas receitas favoritas</Text>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator testID="activity-indicator" size="large" color={colors.green[600]} />
        </View>
      ) : (
        <FlatList
          testID="recipe-flatlist"
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeList data={item} previousRoute="favorite" offline />}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="mt-4 flex-1 items-center justify-center">
              <Text className="px-6 font-regular text-xl text-black-900">
                Nenhuma receita encontrada, após favoritar uma receita ela aparecerá aqui.
              </Text>
              <Image source={RecipeImage} className="mt-3 h-44 w-44 opacity-50" />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
