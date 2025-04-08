import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { Header } from '@/components/Header';
import { ErrorCard } from '@/components/ErrorCard';
import { Ingredients } from '@/components/Ingredients';
import { Instructions } from '@/components/Instructions';
import { Rate } from '@/components/Rate';

import { useToast } from '@/contexts/Toast';
import formatTime from '@/utils/formatTime';
import { useUserStore } from '@/store/userStore';
import { useOfflineStore } from '@/store/offlineStore';
import { Ingredient, Instruction, useRecipeById } from '@/hooks/useRecipeById';
import { favoriteRecipe, getFavoriteRecipeById, unfavoriteRecipe } from '@/services/favoritesLocal';

import { colors } from '@/styles/colors';

import Kitchen from '@/assets/kitchen.svg';
import Pan from '@/assets/pan.svg';
import List from '@/assets/list.svg';

import Easy from '@/assets/easy.svg';
import Medium from '@/assets/medium.svg';
import Hard from '@/assets/hard.svg';
import IngredientsImage from '@/assets/ingredients.svg';
import Fire from '@/assets/fire.svg';
import Time from '@/assets/time.svg';

type SearchParams = {
  id: string;
};

type RecipeSection = {
  title: string;
  data: (Ingredient | Instruction)[];
  type: 'ingredient' | 'instruction' | 'separator';
};

type RecipeSectionData = RecipeSection & {
  renderItem: (info: {
    item: Ingredient | Instruction;
    index: number;
  }) => React.ReactElement | null;
  renderSectionHeader: () => React.ReactElement;
};

export default function Recipe() {
  const { isOffline } = useOfflineStore();
  const { userId } = useUserStore();

  const { id } = useLocalSearchParams<SearchParams>();
  const { data: food, isLoading, error, refetch } = useRecipeById(id, isOffline, userId as string);
  const [favorite, setFavorite] = useState(false);
  const [highestCheckedStep, setHighestCheckedStep] = useState(0);
  const { showToast } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [rate, setRate] = useState(0);
  const [userRate, setUserRate] = useState(0);

  const fullStars = Math.floor(rate);
  const hasHalfStar = rate - fullStars >= 0.5 && fullStars < 5;

  let globalInstructionIndex = 0;

  const changeRate = (newRate: number) => {
    setRate(newRate);
  };

  const changeUserRate = (newRate: number) => {
    setUserRate(newRate);
  };

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
    changeRate(Number(food?.rating) || 0);
    changeUserRate(Number(food?.user_rating) || 0);
  }, [id, food]);

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

  const handleCloseRateModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1">
      <Header title={food?.name as string} favorite={favorite} handleFavorite={handleFavorite} />
      <ScrollView
        className="bg-gray-300"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        {Math.floor(rate) > 0 && (
          <View className="my-2 flex-row items-center justify-center gap-2">
            {Array.from({ length: 5 }, (_, index) => {
              const starNumber = index + 1;
              if (starNumber <= fullStars) {
                return (
                  <Ionicons key={starNumber} name="star" size={30} color={colors.yellow[500]} />
                );
              } else if (starNumber === fullStars + 1 && hasHalfStar) {
                return (
                  <Ionicons
                    key={starNumber}
                    name="star-half-outline"
                    size={30}
                    color={colors.yellow[500]}
                  />
                );
              } else {
                return (
                  <Ionicons
                    key={starNumber}
                    name="star-outline"
                    size={30}
                    color={colors.yellow[500]}
                  />
                );
              }
            })}
            <Text className="self-end font-bold text-lg">({rate})</Text>
          </View>
        )}
        <Image
          testID="recipe-cover"
          className="mt-3 h-72 w-full rounded-t-2xl"
          source={{ uri: food?.cover }}
          resizeMode="cover"
          role="img"
          aria-label={food?.name}
        />
        <View className="p-4">
          <Text className="mb-4 font-bold text-xl">{food?.name}</Text>
          <View className="flex-row flex-wrap justify-center gap-3 ">
            <View className="w-[47%] items-center rounded-md bg-gray-100 p-3">
              <IngredientsImage width={35} height={35} fill={colors.green[900]} />
              <View className="mt-3 flex-row items-center justify-center gap-2">
                <Text className="text-md font-semibold">{food?.total_ingredients}</Text>
                <Text className="font-semibold">Ingredientes</Text>
              </View>
            </View>
            <View className="w-[47%] items-center rounded-md bg-gray-100 px-3">
              {food?.difficulty === 'Difícil' ? (
                <Hard width={55} height={55} />
              ) : food?.difficulty === 'Intermediário' ? (
                <Medium width={55} height={55} />
              ) : (
                <Easy width={55} height={55} />
              )}
              <Text className="relative -top-1 font-bold text-lg">{food?.difficulty}</Text>
            </View>
            <View className="w-[47%] items-center rounded-md bg-gray-100 p-3">
              <Time width={35} height={35} fill={colors.green[900]} />
              <View className="mt-2 items-center justify-center">
                <Text className="font-semibold">Tempo de preparo</Text>
                <Text className="text-md font-semibold">
                  {formatTime(food?.time ? Number(food.time) : 0)}
                </Text>
              </View>
            </View>
            <View className="w-[47%] items-center rounded-md bg-gray-100 p-3">
              <Fire width={35} height={35} fill={colors.green[900]} color={colors.green[900]} />
              <View className="mt-2 items-center justify-center">
                <Text className="font-semibold">Calorias</Text>
                <Text className="text-md font-semibold">{food?.calories ?? '-'}</Text>
              </View>
            </View>
            <View className="w-[47%] items-center rounded-md bg-gray-100 p-3">
              <MaterialCommunityIcons name="star" size={35} color={colors.green[900]} />
              <View className="mt-2 items-center justify-center">
                <Text className="font-semibold">Sua avaliação</Text>
                <Text className="text-md font-semibold">{`${userRate === 0 ? '-' : userRate === 1 ? userRate + ' estrela' : userRate + ' estrelas'}`}</Text>
              </View>
            </View>
            <View className="w-[47%] items-center justify-center rounded-md  p-3">
              <Pressable
                className={`mt-3 flex-row items-center rounded-full 
                  ${isOffline ? 'bg-gray-500' : 'bg-green-600'} px-4 py-2`}
                onPress={() => setModalVisible(true)}
                disabled={isOffline}
                aria-disabled={isOffline}>
                <Text className="font-bold text-base text-white-100">{`${userRate === 0 ? 'Avaliar receita' : 'alterar avaliação'}`}</Text>
              </Pressable>
            </View>
          </View>
          <Text className="mb-2 mt-4 text-center font-bold text-2xl text-black-900">
            Tipo de comida
          </Text>
          <View className="mt-3 flex-row flex-wrap justify-center">
            {food?.food_types.map((type) => (
              <View
                key={type.id}
                className="mb-2 mr-2 items-center justify-center rounded-md bg-gray-500 px-5 py-2">
                <Text className="text-md font-medium text-white-100">{type.name}</Text>
              </View>
            ))}
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
      <Rate
        testID="rate-modal"
        visible={modalVisible}
        onClose={handleCloseRateModal}
        setNewRating={changeRate}
        recipeId={food?.id as string}
        userId={userId}
        initialRating={userRate}
        setUserRate={changeUserRate}
      />
    </SafeAreaView>
  );
}
