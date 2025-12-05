import React, { useState } from 'react';
import { TouchableOpacity, View, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AccessibilityPanel from './AccessibilityPanel';
import { useAccessibility } from './AccessibilityContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingAccessibilityButton() {
  const [open, setOpen] = useState(false);
  const { state } = useAccessibility();
  const insets = useSafeAreaInsets();

  // Ajuste de bottom para ficar acima do tabBar (tabBar do seu app tem height ~90).
  // Se seu tabBar for diferente ajuste `TABBAR_HEIGHT`.
  const TABBAR_HEIGHT = 90;
  const bottomPosition = insets.bottom + TABBAR_HEIGHT + 16;

  return (
    <>
      <TouchableOpacity
        accessibilityLabel="Abrir configurações de acessibilidade"
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
        style={[
          styles.button,
          { bottom: bottomPosition },
        ]}
      >
        <Ionicons name="accessibility" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)} transparent>
        <View style={styles.modalOverlay}>
          <AccessibilityPanel onClose={() => setOpen(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 18,
    // bottom is calculated dynamically above
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    // Android elevation + iOS shadow
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // zIndex para iOS (android usa elevation)
    zIndex: 99999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
});
