import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, ModalProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/services/api';
import { useToast } from '@/contexts/Toast';

import { colors } from '@/styles/colors';

type RateModalProps = ModalProps & {
  visible: boolean;
  recipeId: string;
  userId: string | null;
  initialRating: number;
  onClose: () => void;
  setUserRate: (rating: number) => void;
  setNewRating: (rating: number) => void;
};

type DataProps = {
  status: string;
  data: {
    recipe_id: number;
    user_id: number;
    rate: number;
    average: number;
  };
};

const ratingMessages: Record<number, string> = {
  1: 'Péssima Receita 👎',
  2: 'Receita Ruim 😕',
  3: 'Receita Regular 🙂',
  4: 'Ótima Receita 👍',
  5: 'Excelente Receita 🤩',
};

export function Rate({
  visible,
  recipeId,
  userId,
  initialRating,
  onClose,
  setUserRate,
  setNewRating,
  ...rest
}: RateModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const { showToast } = useToast();

  const submitRating = async () => {
    try {
      const response = await api.post(`/rate`, {
        recipe_id: recipeId,
        user_id: userId,
        rate: selectedRating,
      });
      const data = response.data as DataProps;

      if (data.status === 'success') {
        showToast('Avaliação enviada com sucesso!', 'success');
        setNewRating(data.data.average);
        setUserRate(selectedRating);
      }
    } catch (error) {
      showToast('Erro ao enviar avaliação', 'danger');
      console.error('Erro ao enviar avaliação:', error);
    } finally {
      onClose();
    }
  };

  useEffect(() => {
    setSelectedRating(initialRating === 0 ? 5 : initialRating);
  }, [initialRating]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      accessibilityViewIsModal={true}
      onRequestClose={onClose}
      {...rest}>
      <View
        className="flex-1 items-center justify-center bg-black-900/50"
        accessible={true}
        accessibilityLabel="Modal de Avaliação">
        <View className="w-4/5 items-center rounded-xl bg-white-100 p-5">
          <Text className="mb-5 font-bold text-xl">Avalie a receita</Text>
          <Text className="mb-3 text-lg" accessibilityLabel={ratingMessages[selectedRating]}>
            {ratingMessages[selectedRating]}
          </Text>
          <View
            className="mb-5 flex-row"
            accessible={true}
            accessibilityRole="adjustable"
            accessibilityLabel="Avaliação por estrelas">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                role="button"
                accessibilityRole="button"
                key={star}
                accessibilityLabel={`Selecionar ${star} estrela${star > 1 ? 's' : ''}`}
                onPress={() => setSelectedRating(star)}>
                <Ionicons
                  name={star <= selectedRating ? 'star' : 'star-outline'}
                  size={42}
                  color={colors.yellow[500]}
                />
              </Pressable>
            ))}
          </View>
          <TouchableOpacity
            role="button"
            accessibilityRole="button"
            activeOpacity={0.8}
            className="my-1.5 w-full items-center rounded-md bg-green-600 p-2.5"
            onPress={submitRating}>
            <Text className="font-bold text-white-100">Enviar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            role="button"
            accessibilityRole="button"
            activeOpacity={0.8}
            className="my-1.5 w-full items-center rounded-md bg-red-900 p-2.5"
            onPress={onClose}>
            <Text className="font-bold text-white-100">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
