import { Logo } from '@/components/Logo';
import { SafeAreaView, Text, View } from 'react-native';

export default function Home() {
  return (
    <SafeAreaView className="flex-1">
      <Logo />
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl">Home</Text>
      </View>
    </SafeAreaView>
  );
}
