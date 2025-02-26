import { Tabs } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.black[900],

        tabBarStyle: {
          backgroundColor: colors.white[100],
          borderTopWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarActiveTintColor: colors.green[900],
          tabBarIcon: ({ color, size }) => (
            <Entypo className="-mb-2" name="bowl" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarActiveTintColor: colors.green[900],
          tabBarIcon: ({ color, size }) => (
            <Ionicons className="-mb-2" name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          tabBarIcon: ({ color, size, focused }) => {
            if (focused) {
              return (
                <Ionicons className="-mb-2" name="heart" size={size} color={colors.red[900]} />
              );
            }
            return <Ionicons className="-mb-2" name="heart-outline" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
