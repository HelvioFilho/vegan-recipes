import '@/styles/global.css';
import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupDatabase } from '@/services/setupDatabase';
import { checkAndCreateLocalUser } from '@/services/checkUser';
import { fetchFoodTypesIfNeeded } from '@/services/foodTypesLocal';
import { useOfflineStore } from '@/store/offlineStore';
import { ToastProvider } from '@/contexts/Toast';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });

  const { isOffline, setIsOffline } = useOfflineStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || state.isInternetReachable === false;
      setIsOffline(offline);
    });

    return () => {
      unsubscribe();
    };
  }, [setIsOffline]);

  const startSetup = async () => {
    try {
      await setupDatabase();

      if (!isOffline) {
        await fetchFoodTypesIfNeeded();
        await checkAndCreateLocalUser();
      }

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
  }, [loaded, error, isOffline]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ToastProvider>
    </QueryClientProvider>
  );
}
