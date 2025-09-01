import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  buscarCuponsDisponiveis, 
  resgatarCupom 
} from '../utils/cupomManager';

const LeitorQR = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const [showCuponsModal, setShowCuponsModal] = useState(false);
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState([]);
  const [usuarioEscaneado, setUsuarioEscaneado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo?.tipo_usuario_id === 2) {
      fetchCuponsDisponiveis();
    }
  }, [userInfo]);

  const fetchCuponsDisponiveis = async () => {
    try {
      setLoading(true);
      const result = await buscarCuponsDisponiveis(userInfo.id);
      
      if (result.success) {
        setCuponsDisponiveis(result.data);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      Alert.alert('Erro', 'Não foi possível carregar os cupons');
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScanned = async (userId) => {
    try {
      setLoading(true);
      
      // Buscar informações do usuário escaneado
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (usuarioError) throw usuarioError;

      setUsuarioEscaneado(usuario);
      setShowCuponsModal(true);
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      Alert.alert('Erro', 'Não foi possível processar o QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleCupomResgate = async (cupomId, usuarioId) => {
    try {
      setLoading(true);

      const result = await resgatarCupom(cupomId, usuarioId);
      
      if (result.success) {
        Alert.alert(
          'Sucesso!', 
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCuponsModal(false);
                setUsuarioEscaneado(null);
                fetchCuponsDisponiveis();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      console.error('Erro ao resgatar cupom:', error);
      Alert.alert('Erro', 'Não foi possível resgatar o cupom');
    } finally {
      setLoading(false);
    }
  };

  const simularQRCode = () => {
    // Simulação para teste - em produção seria um scanner real
    const userId = Math.floor(Math.random() * 1000) + 1;
    handleQRCodeScanned(userId);
  };

  return (
    <LinearGradient
      colors={["#c83349", "#0f142c"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leitor de QR Code</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.scannerContainer}>
          <MaterialCommunityIcons 
            name="qrcode-scan" 
            size={120} 
            color="#fff" 
            style={styles.scannerIcon}
          />
          <Text style={styles.scannerTitle}>Escaneie o QR Code</Text>
          <Text style={styles.scannerSubtitle}>
            Apresente o QR Code do usuário para resgatar cupons
          </Text>
          
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={simularQRCode}
            disabled={loading}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#fff" />
            <Text style={styles.scanButtonText}>
              {loading ? 'Processando...' : 'Simular Escaneamento'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Como funciona?</Text>
          <Text style={styles.infoText}>
            1. O usuário apresenta seu QR Code{'\n'}
            2. Você seleciona o cupom a ser resgatado{'\n'}
            3. O sistema registra o resgate{'\n'}
            4. O usuário não pode usar o mesmo cupom novamente
          </Text>
        </View>
      </View>

      {/* Modal de Cupons */}
      <Modal
        visible={showCuponsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCuponsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Usuário Escaneado</Text>
              <TouchableOpacity 
                onPress={() => setShowCuponsModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {usuarioEscaneado && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.usuarioInfo}>
                  <Text style={styles.usuarioNome}>{usuarioEscaneado.nome}</Text>
                  <Text style={styles.usuarioEmail}>{usuarioEscaneado.email}</Text>
                  <Text style={styles.usuarioTipo}>
                    Tipo: {usuarioEscaneado.tipo_usuario_id === 1 ? 'Administrador' : 
                           usuarioEscaneado.tipo_usuario_id === 2 ? 'Parceiro' : 'Usuário Comum'}
                  </Text>
                </View>

                <View style={styles.cuponsSection}>
                  <Text style={styles.sectionTitle}>Cupons Disponíveis para Resgate</Text>
                  {cuponsDisponiveis.length > 0 ? (
                    cuponsDisponiveis.map((cupom) => (
                      <View key={cupom.id} style={styles.cupomCard}>
                        <Text style={styles.cupomNome}>{cupom.campanha?.nome}</Text>
                        <Text style={styles.cupomDescricao}>{cupom.descricao}</Text>
                        <Text style={styles.cupomQuantidade}>
                          Disponível: {cupom.quantidade_disponivel}
                        </Text>
                        <Text style={styles.cupomValidade}>
                          Válido até: {new Date(cupom.data_validade).toLocaleDateString('pt-BR')}
                        </Text>
                        
                        <TouchableOpacity
                          style={styles.resgatarButton}
                          onPress={() => handleCupomResgate(cupom.id, usuarioEscaneado.id)}
                          disabled={loading}
                        >
                          <Text style={styles.resgatarButtonText}>
                            {loading ? 'Processando...' : 'Resgatar Cupom'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCuponsText}>
                      Nenhum cupom disponível para resgate
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default LeitorQR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  scannerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  scannerIcon: {
    marginBottom: 20,
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  scannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  usuarioInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  usuarioNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  usuarioEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  usuarioTipo: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  cuponsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#c83349',
    paddingBottom: 5,
  },
  cupomCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  cupomNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cupomDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cupomQuantidade: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cupomValidade: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
  },
  resgatarButton: {
    backgroundColor: '#c83349',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  resgatarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noCuponsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
