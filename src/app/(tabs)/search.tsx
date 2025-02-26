import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, SafeAreaView, Text, ActivityIndicator, View, Image } from 'react-native';

import { Filters } from '@/components/Filters';
import { ErrorCard } from '@/components/ErrorCard';
import { RecipeList } from '@/components/RecipeList';
import { SearchInput } from '@/components/SearchInput';
import { SearchMessage } from '@/components/SearchMessage';
import { ListFooterLoading } from '@/components/ListFooterLoading';

import { useFoodTypes } from '@/hooks/useFoodTypes';
import { useInfiniteSearchRecipes } from '@/hooks/useSearchRecipes';

import { colors } from '@/styles/colors';

import RecipeImage from '@/assets/recipes.png';

type filterByDifficulty = {
  difficulty?: string;
};

type filterByFoodType = {
  foodType?: number[];
};

export default function search() {
  const { search: searchParam } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByDifficulty, setFilterByDifficulty] = useState<filterByDifficulty>({});
  const [filterByFoodType, setFilterByFoodType] = useState<filterByFoodType>({});

  const router = useRouter();

  const { data: foodTypesData } = useFoodTypes();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    router.replace(`/search?search=${encodeURIComponent(value)}`);
  };

  const handleApplyFilters = (
    newDifficultyFilter: filterByDifficulty,
    newFoodTypeFilter: filterByFoodType
  ) => {
    setFilterByDifficulty(newDifficultyFilter);

    if (newFoodTypeFilter.foodType) {
      newFoodTypeFilter.foodType = newFoodTypeFilter.foodType
        .map((item) => {
          return item;
        })
        .filter((item) => item !== undefined);
      setFilterByFoodType(newFoodTypeFilter);
    } else {
      setFilterByFoodType(newFoodTypeFilter);
    }
  };

  const consult =
    searchQuery +
    (filterByDifficulty.difficulty ? `&difficulty=${filterByDifficulty.difficulty}` : '') +
    (filterByFoodType.foodType ? `&food_types=${filterByFoodType.foodType}` : '');

  const isAnyFilterActive = Boolean(
    searchQuery || filterByDifficulty.difficulty || filterByFoodType.foodType
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteSearchRecipes(consult);

  const recipes = data?.pages.flatMap((page) => page.recipes) || [];

  const isLoadingComponent = () => {
    return (
      <SafeAreaView testID="loading-view" className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.green[600]} />
      </SafeAreaView>
    );
  };

  useEffect(() => {
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam as string);
    }
  }, [searchParam]);

  return (
    <SafeAreaView className="flex-1">
      <Filters
        applyFilters={handleApplyFilters}
        difficulty={filterByDifficulty.difficulty}
        foodType={filterByFoodType.foodType}
        foodTypesData={foodTypesData}
      />
      <SearchInput
        handleSearch={handleSearch}
        value={(searchParam ? searchParam : searchQuery) as string}
      />
      <SearchMessage
        searchQuery={searchQuery}
        filterByDifficulty={filterByDifficulty}
        filterByFoodType={filterByFoodType}
        foodTypesData={foodTypesData}
      />
      {isLoading ? (
        isLoadingComponent()
      ) : error ? (
        <ErrorCard />
      ) : (
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
          ListEmptyComponent={
            isAnyFilterActive && recipes.length === 0 ? (
              <View className="mt-4 flex-1 items-center justify-center">
                <Text className="px-4 font-regular text-xl text-black-900">
                  Nenhuma receita encontrada, verifique a ortografia ou altere os filtros de busca.
                </Text>
                <Image source={RecipeImage} className="mt-3 h-44 w-44 opacity-50" />
              </View>
            ) : null
          }
          ListFooterComponent={isFetchingNextPage ? <ListFooterLoading /> : null}
        />
      )}
    </SafeAreaView>
  );
}
