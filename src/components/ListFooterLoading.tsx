import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '@/styles/colors';

export function ListFooterLoading() {
  return (
    <View className="flex-row items-center justify-center p-4">
      <ActivityIndicator testID="activity-indicator" size="small" color={colors.green[600]} />
      <Text className="ml-2 font-semibold text-green-600">Carregando mais receitas...</Text>
    </View>
  );
}
