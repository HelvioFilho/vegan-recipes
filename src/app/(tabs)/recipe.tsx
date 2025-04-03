import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { ErrorCard } from '@/components/ErrorCard';
import { Ingredients } from '@/components/Ingredients';
import { Instructions } from '@/components/Instructions';

import { useToast } from '@/contexts/Toast';
import formatTime from '@/utils/formatTime';
import { useOfflineStore } from '@/store/offlineStore';
import { Ingredient, Instruction, useRecipeById } from '@/hooks/useRecipeById';
import { favoriteRecipe, getFavoriteRecipeById, unfavoriteRecipe } from '@/services/favoritesLocal';

import { colors } from '@/styles/colors';

import Kitchen from '@/assets/kitchen.svg';
import Pan from '@/assets/pan.svg';
import List from '@/assets/list.svg';

type SearchParams = {
  id: string;
};

export default function Recipe() {
  const { isOffline } = useOfflineStore();
  const { id } = useLocalSearchParams<SearchParams>();
  const { data: food, isLoading, error, refetch } = useRecipeById(id, isOffline);
  const [favorite, setFavorite] = useState(false);
  const [highestCheckedStep, setHighestCheckedStep] = useState(0);
  const { showToast } = useToast();

  let globalInstructionIndex = 0;

  const checkFavorite = async () => {
    if (id) {
      const fav = await getFavoriteRecipeById(id);
      setFavorite(!!fav);
    }
  };

  const handleFavorite = async () => {
    try {
      if (!food) return;
      if (favorite) {
        setFavorite(false);
        showToast('Receita removida dos favoritos!', 'danger');
        await unfavoriteRecipe(food.id);
      } else {
        showToast('Receita adicionada aos favoritos!', 'success');
        setFavorite(true);
        await favoriteRecipe(food);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleInstruction = (index: number) => {
    if (index > highestCheckedStep) {
      setHighestCheckedStep(index);
    } else {
      setHighestCheckedStep(index - 1);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    checkFavorite();
  }, [id]);

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

  const ingredientsGroupedBySection =
    food &&
    food.ingredients.reduce(
      (sectionsMap, ingredient) => {
        const sectionName = ingredient.section ?? 'Outros';

        if (!sectionsMap[sectionName]) {
          sectionsMap[sectionName] = [];
        }
        sectionsMap[sectionName].push(ingredient);
        return sectionsMap;
      },
      {} as Record<string, Ingredient[]>
    );

  const instructionsGroupedByStep =
    food &&
    food.instructions.reduce(
      (stepsMap, instruction) => {
        const step = instruction.step;

        if (!stepsMap[step]) {
          stepsMap[step] = [];
        }
        stepsMap[step].push(instruction);
        return stepsMap;
      },
      {} as Record<string, Instruction[]>
    );
  return (
    <SafeAreaView className="flex-1">
      <Header title={food?.name as string} favorite={favorite} handleFavorite={handleFavorite} />
      <ScrollView
        className="bg-gray-300"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Image
          testID="recipe-cover"
          className="mt-3 h-72 w-full rounded-t-2xl"
          source={{ uri: food?.cover }}
          resizeMode="cover"
          role="img"
          aria-label={food?.name}
        />
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-1">
            <Text className="mb-1 mt-2 font-bold text-lg text-black-900">{food?.name}</Text>
            <View className="gap-1">
              <Text className="font-regular text-base text-black-900">
                {food?.total_ingredients} ingredientes
              </Text>
              <Text className="font-regular text-base text-black-900">
                Tempo de preparo: {formatTime(food?.time ? Number(food.time) : 0)}
              </Text>
              <Text className="font-regular text-base text-black-900">
                Dificuldade da receita: {food?.difficulty}
              </Text>
              <Text className="font-regular text-base text-black-900">
                Calorias por porção: {food?.calories ? food.calories : 'Não consta na receita'}
              </Text>
            </View>
            <View className="my-2 flex-row gap-2">
              {food?.food_types.map((foodType) => (
                <View
                  key={foodType.id}
                  testID={`food-type-${foodType.id}`}
                  accessibilityLabel={foodType.name}
                  className="mt-2 flex-row items-center  rounded-3xl bg-gray-200 px-5 py-2">
                  <Text className="text-base font-semibold text-black-900">{foodType.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        {food?.observation && (
          <View className="px-4 pb-4">
            <Text className="text-center font-bold text-2xl text-black-900">Observação</Text>
            <View className="mt-2 rounded-3xl bg-white-100 px-3 py-4">
              <Text className="font-regular text-base text-black-900">{food?.observation}</Text>
            </View>
          </View>
        )}
        <View className="mx-3 mb-3 flex-row items-center justify-center gap-3 rounded-md bg-green-600 py-2">
          <List width={28} height={28} fill={colors.white[100]} />
          <Text className="font-bold text-2xl text-white-100">Lista de ingredientes</Text>
        </View>
        {ingredientsGroupedBySection &&
          Object.entries(ingredientsGroupedBySection).map(([sectionName, ingredientsArray]) => (
            <View key={sectionName} className="mb-3 flex-1">
              <View className="mb-3  flex-row items-center gap-2 px-3 py-2">
                <Ionicons name="newspaper-outline" size={24} color={colors.green[900]} />
                <Text className="mr-4 flex-wrap pl-2 pr-4 font-bold text-xl">{sectionName}</Text>
              </View>
              {ingredientsArray.map((ingredient) => (
                <Ingredients key={ingredient.id} data={ingredient} />
              ))}
            </View>
          ))}
        <View className="mx-3 mb-3 flex-row items-center justify-center gap-3 rounded-md bg-green-600 py-2">
          <Kitchen width={28} height={28} fill={colors.white[100]} />
          <Text className="font-bold text-2xl text-white-100">Modo de Preparo</Text>
        </View>
        {instructionsGroupedByStep &&
          Object.entries(instructionsGroupedByStep).map(([step, instructionsArray]) => (
            <View key={step} className="mx-3 mb-1 flex-1">
              <View className="mb-2 flex-row items-center justify-start gap-3 py-2">
                <View className="pb-2">
                  <Pan width={28} height={28} fill={colors.green[900]} />
                </View>
                <Text className="mr-4 flex-wrap pl-2 pr-4 font-bold text-xl">{step}</Text>
              </View>
              {instructionsArray.map((instructions) => {
                globalInstructionIndex += 1;
                const index = globalInstructionIndex;
                return (
                  <Instructions
                    key={instructions.id}
                    data={instructions}
                    index={index}
                    checked={index <= highestCheckedStep}
                    onToggle={() => handleToggleInstruction(index)}
                  />
                );
              })}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
