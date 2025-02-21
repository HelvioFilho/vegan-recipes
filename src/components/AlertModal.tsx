import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type AlertModalProps = {
  message: string;
  children: React.ReactNode;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
};

export function AlertModal({ message, children, showModal, setShowModal }: AlertModalProps) {
  return (
    <Modal
      transparent
      visible={showModal}
      animationType="fade"
      onRequestClose={() => setShowModal(false)}>
      <View className="flex-1 items-center justify-center bg-black-900/50">
        <View className="relative w-4/5 rounded-lg bg-white-100 p-5">
          <TouchableOpacity
            role="button"
            accessibilityRole="button"
            onPress={() => setShowModal(false)}
            className="absolute right-2 top-2">
            <Ionicons name="close" size={26} color="black" />
          </TouchableOpacity>
          <Text className="font-regular my-5 text-base">{message}</Text>
          {children && children}
        </View>
      </View>
    </Modal>
  );
}
