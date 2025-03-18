import { SafeAreaView, View, Text, Linking } from 'react-native';
import { Button } from './Button';

type ErrorCardProps = {
  handleRefresh: () => void;
};

export function ErrorCard({ handleRefresh }: ErrorCardProps) {
  const handleEmailPress = () => {
    Linking.openURL('mailto:suporte@vegan-recipes.hsvf.com.br?subject=Erro%204010B');
  };
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 p-4">
      <View className="bg-white rounded-lg p-6">
        <Text className="mb-2 text-center font-bold text-lg text-black-500">
          Ocorreu um erro inesperado
        </Text>
        <Text className="font-regular text-base text-black-500">
          Uma possível causa é a falta de internet, verifique sua conexão e tente novamente.{' '}
          {'\n\n'}
          Caso o erro persista, entre em contato com o suporte pelo e-mail{' '}
          <Text className="font-bold text-green-600 underline" onPress={handleEmailPress}>
            suporte@vegan-recipes.hsvf.com.br
          </Text>{' '}
          e informe o código de erro: <Text className="font-bold text-red-900">4010B</Text>.
        </Text>
        <Button
          className="mt-4 h-12 items-center justify-center rounded-full bg-green-800 px-4 py-2"
          title="Tentar novamente"
          buttonStyle="text-white-100 font-bold text-lg"
          onPress={handleRefresh}
        />
      </View>
    </SafeAreaView>
  );
}
