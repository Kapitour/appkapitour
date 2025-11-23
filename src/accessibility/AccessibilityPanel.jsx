// AccessibilityPanel.js
import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { useAccessibility } from './AccessibilityContext'; // ajuste o path conforme seu projeto

// Componente simples de controle TTS (só alterna o estado aqui).
function TTSButton() {
  const { state, update } = useAccessibility();

  const toggleTTS = () => {
    update({ ttsEnabled: !state.ttsEnabled });
    // Se quiser, aqui você pode integrar com react-native-tts ou expo-speech para narrar algo.
  };

  return (
    <TouchableOpacity style={styles.smallBtn} onPress={toggleTTS}>
      <Text style={styles.modeText}>{state.ttsEnabled ? 'Desligar' : 'Ativar'}</Text>
    </TouchableOpacity>
  );
}

/**
 * AccessibilityPanel
 * Props:
 *  - visible: boolean (se usar Modal)
 *  - onClose: função para fechar
 */
export default function AccessibilityPanel({ onClose = () => {} }) {
  const { state, update, reset } = useAccessibility();

  // utilitário toggle genérico
  const toggle = (key) => {
    update({ [key]: !state[key] });
  };

  const decFont = () => {
    const next = Math.max(0.8, Math.round(((state.fontScale || 1) - 0.1) * 10) / 10);
    update({ fontScale: next });
  };
  const incFont = () => {
    const next = Math.min(1.8, Math.round(((state.fontScale || 1) + 0.1) * 10) / 10);
    update({ fontScale: next });
  };

  const speakSelection = () => {
    const rate = state.ttsRate || 1.0;
    if (Platform.OS === 'web') {
      const text = (state.ttsBuffer && state.ttsBuffer.trim()) || (window.getSelection ? String(window.getSelection().toString()) : '') || document.activeElement?.textContent || '';
      if (!text) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      return;
    }
    const text = state.ttsBuffer || '';
    if (!text) return;
    Speech.stop();
    Speech.speak(text, { rate: Math.max(0.5, Math.min(1.5, rate)) });
  };

  const stopSpeaking = () => {
    if (Platform.OS === 'web') {
      window.speechSynthesis.cancel();
      return;
    }
    Speech.stop();
  };

  return (
    <View style={styles.backdrop}>
      <View style={[styles.container, state.darkMode && styles.containerDark]}>
        <View style={styles.header}>
          <Text style={[styles.title, state.darkMode && styles.titleDark]}>Acessibilidade</Text>
          <Pressable onPress={onClose}>
            <Text style={[styles.close, state.darkMode && styles.closeDark]}>Fechar</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, state.darkMode && styles.labelDark]}>Tema escuro</Text>
          <Switch value={!!state.darkMode} onValueChange={() => update({ darkMode: !state.darkMode })} />
        </View>

        <View style={styles.row}>
          
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, state.darkMode && styles.labelDark]}>Tamanho da fonte</Text>
          <View style={styles.fontControls}>
            <TouchableOpacity style={styles.smallBtn} onPress={decFont}><Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>-</Text></TouchableOpacity>
            <Text style={[styles.fontValue, state.darkMode ? styles.modeTextDark : styles.modeText]}>{(state.fontScale || 1).toFixed(1)}x</Text>
            <TouchableOpacity style={styles.smallBtn} onPress={incFont}><Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, state.darkMode && styles.labelDark]}>Leitor de tela</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => update({ ttsEnabled: !state.ttsEnabled })}>
              <Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>{state.ttsEnabled ? 'Desligar' : 'Ativar'}</Text>
            </TouchableOpacity>
            {(
              Platform.OS === 'web'
            ) && (
              <>
                <TouchableOpacity style={styles.smallBtn} onPress={speakSelection}>
                  <Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>Ler texto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallBtn} onPress={stopSpeaking}>
                  <Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>Parar</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => update({ ttsRate: Math.max(0.5, (state.ttsRate || 1) - 0.2) })}>
                    <Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>Lento</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => update({ ttsRate: Math.min(1.8, (state.ttsRate || 1) + 0.2) })}>
                    <Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>Rápido</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.resetBtn, state.darkMode && styles.resetBtnDark]}
            onPress={reset}
          >
            <Text style={state.darkMode ? styles.modeTextDark : styles.modeText}>Restaurar padrões</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 18,
    minHeight: 340,
  },
  containerDark: {
    backgroundColor: '#1c1c1e',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#000' },
  titleDark: { color: '#fff' },
  close: { color: '#0A84FF', fontWeight: '600' },
  closeDark: { color: '#64b5ff' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  rowColumn: { marginTop: 16 },
  label: { fontSize: 16, color: '#000' },
  labelDark: { color: '#e6e6e6' },
  fontControls: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  fontValue: { minWidth: 46, textAlign: 'center' },
  modeText: { color: '#000' },
  modeTextDark: { color: '#fff' },
  footer: { marginTop: 20, alignItems: 'center' },
  resetBtn: { padding: 10, backgroundColor: '#eee', borderRadius: 8 },
  resetBtnDark: { backgroundColor: '#2a2a2a' },
});

