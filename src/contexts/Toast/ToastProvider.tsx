import React, { createContext, useState, useCallback } from 'react';
import { Text } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { colors } from '@/styles/colors';

type AlertType = 'success' | 'danger' | 'warning';

type ToastContextProps = {
  showToast: (message: string, type?: AlertType) => void;
};

export const ToastContext = createContext<ToastContextProps | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [toastColors, setToastColors] = useState<string>('');

  const showToast = useCallback((msg: string, toastType: AlertType = 'success') => {
    let selectedColors =
      toastType === 'success'
        ? colors.green[600]
        : toastType === 'danger'
          ? colors.red[900]
          : colors.yellow[500];

    setMessage(msg);
    setVisible(true);
    setToastColors(selectedColors);

    setTimeout(() => setVisible(false), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {visible && (
          <MotiView
            testID="toast-container"
            from={{ opacity: 0, translateY: -50 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -50 }}
            transition={{ type: 'timing', duration: 300 }}
            style={{
              position: 'absolute',
              top: 55,
              alignSelf: 'center',
              backgroundColor: toastColors,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
              zIndex: 1000,
            }}>
            <Text className="font-bold text-lg text-white-100">{message}</Text>
          </MotiView>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};
