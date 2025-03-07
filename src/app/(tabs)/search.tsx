import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, SafeAreaView, Text, ActivityIndicator, View, Image } from 'react-native';

import { Button } from '@/components/Button';
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
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);
  const [consult, setConsult] = useState('');

  const router = useRouter();

  const { data: foodTypesData } = useFoodTypes();

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
    }
    setFilterByFoodType(newFoodTypeFilter);
    const finalQuery = buildConsultQuery(searchQuery, newDifficultyFilter, newFoodTypeFilter);
    setConsult(encodeURI(finalQuery));
  };

  const buildConsultQuery = useCallback(
    (
      searchQuery: string,
      filterByDifficulty: filterByDifficulty,
      filterByFoodType: filterByFoodType
    ): string => {
      let finalQuery = searchQuery.trim();
      if (filterByDifficulty.difficulty) {
        finalQuery += `&difficulty=${filterByDifficulty.difficulty}`;
      }
      if (filterByFoodType.foodType) {
        finalQuery += `&food_types=${filterByFoodType.foodType}`;
      }

      if (
        filterByDifficulty.difficulty?.length === 0 &&
        filterByFoodType.foodType?.length === 0 &&
        searchQuery.length === 0
      ) {
        setIsAnyFilterActive(false);
      } else {
        setIsAnyFilterActive(true);
      }

      return finalQuery;
    },
    []
  );

  const handleSearch = () => {
    const finalQuery = buildConsultQuery(searchQuery, filterByDifficulty, filterByFoodType);
    setConsult(encodeURI(finalQuery));
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilterByDifficulty({});
    setFilterByFoodType({});
    setConsult('');
    setIsAnyFilterActive(false);
    router.replace('/search');
  };

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
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam as string));
      const finalQuery = buildConsultQuery(
        decodeURIComponent(searchParam as string),
        filterByDifficulty,
        filterByFoodType
      );
      setConsult(encodeURI(finalQuery));
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
      <SearchInput handleSearch={handleSearch} value={searchQuery} setInputValue={setSearchQuery} />
      {isAnyFilterActive && (
        <>
          <Button
            title="Limpar filtros"
            className="text-white mb-2 mt-1 w-1/3 self-center rounded-full bg-red-500 p-1"
            buttonStyle="text-white-100 text-sm font-bold text-center"
            onPress={handleClear}
          />
          <SearchMessage
            searchQuery={searchQuery}
            filterByDifficulty={filterByDifficulty}
            filterByFoodType={filterByFoodType}
            foodTypesData={foodTypesData}
          />
        </>
      )}
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
