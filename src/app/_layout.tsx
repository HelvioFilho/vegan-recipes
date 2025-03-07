import '@/styles/global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupDatabase } from '@/services/setupDatabase';
import { fetchFoodTypesIfNeeded } from '@/services/foodTypesLocal';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });

  const startSetup = async () => {
    try {
      await setupDatabase();
      await fetchFoodTypesIfNeeded();
      await SplashScreen.hideAsync();
    } catch (e) {
      console.log('Erro ao configurar banco e sincronizar dados', e);
      await SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    if (loaded || error) {
      startSetup();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  );
}
