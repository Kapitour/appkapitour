// src/screens/AreaUsuario.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import QRCode from "react-native-qrcode-svg";
import { 
  buscarCuponsDisponiveis, 
  buscarCuponsResgatados,
  buscarHistoricoResgates 
} from "../utils/cupomManager";

const AreaUsuario = () => {
  const navigation = useNavigation();
  const { userInfo, signOut } = useAuth();
  const [showQRCode, setShowQRCode] = useState(false);
  const [showCupons, setShowCupons] = useState(false);
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState([]);
  const [cuponsResgatados, setCuponsResgatados] = useState([]);
  const [loadingCupons, setLoadingCupons] = useState(false);

  useEffect(() => {
    if (userInfo?.tipo_usuario_id === 2) {
      fetchCupons();
    } else if (userInfo?.tipo_usuario_id === 1 || userInfo?.tipo_usuario_id === 3) {
      fetchHistoricoResgates();
    }
  }, [userInfo]);

  const fetchCupons = async () => {
    try {
      setLoadingCupons(true);
      
      const [cuponsResult, resgatadosResult] = await Promise.all([
        buscarCuponsDisponiveis(userInfo.id),
        buscarCuponsResgatados(userInfo.id)
      ]);

      if (cuponsResult.success) {
        setCuponsDisponiveis(cuponsResult.data);
      }

      if (resgatadosResult.success) {
        setCuponsResgatados(resgatadosResult.data);
      }
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      Alert.alert('Erro', 'Não foi possível carregar os cupons');
    } finally {
      setLoadingCupons(false);
    }
  };

  const fetchHistoricoResgates = async () => {
    try {
      setLoadingCupons(true);
      
      const historicoResult = await buscarHistoricoResgates(userInfo.id);
      
      if (historicoResult.success) {
        setCuponsResgatados(historicoResult.data);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoadingCupons(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              console.log("Logout realizado com sucesso!");
            } else {
              Alert.alert("Erro ao sair", result.error);
            }
          },
        },
      ]
    );
  };

  const getTipoUsuarioText = (tipoId) => {
    switch (tipoId) {
      case 1: return "Administrador";
      case 2: return "Parceiro";
      case 3: return "Usuário Comum";
      default: return "Desconhecido";
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color="#333"
        style={styles.icon}
      />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderQRCode = () => {
    if (!userInfo || (userInfo.tipo_usuario_id !== 1 && userInfo.tipo_usuario_id !== 3)) {
      return null;
    }

    return (
      <View style={styles.qrCodeContainer}>
        <Text style={styles.qrCodeTitle}>Seu QR Code</Text>
        <Text style={styles.qrCodeSubtitle}>Apresente para parceiros</Text>
        <TouchableOpacity 
          style={styles.qrCodeButton}
          onPress={() => setShowQRCode(true)}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
          <Text style={styles.qrCodeButtonText}>Ver QR Code</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeitorQR = () => {
    if (!userInfo || userInfo.tipo_usuario_id !== 2) {
      return null;
    }

    return (
      <View style={styles.leitorContainer}>
        <Text style={styles.leitorTitle}>Leitor de QR Code</Text>
        <Text style={styles.leitorSubtitle}>Escaneie QR Codes dos usuários</Text>
        <TouchableOpacity 
          style={styles.leitorButton}
          onPress={() => navigation.navigate('LeitorQR')}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
          <Text style={styles.leitorButtonText}>Abrir Leitor</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCuponsModal = () => (
    <Modal
      visible={showCupons}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCupons(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Meus Cupons</Text>
            <TouchableOpacity 
              onPress={() => setShowCupons(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Cupons Disponíveis (apenas para parceiros) */}
            {userInfo?.tipo_usuario_id === 2 && (
              <View style={styles.cuponsSection}>
                <Text style={styles.sectionTitle}>Cupons Disponíveis</Text>
                {loadingCupons ? (
                  <Text style={styles.loadingText}>Carregando...</Text>
                ) : cuponsDisponiveis.length > 0 ? (
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
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCuponsText}>Nenhum cupom disponível</Text>
                )}
              </View>
            )}

            {/* Cupons Resgatados */}
            <View style={styles.cuponsSection}>
              <Text style={styles.sectionTitle}>
                {userInfo?.tipo_usuario_id === 2 ? 'Cupons Resgatados' : 'Meus Cupons Resgatados'}
              </Text>
              {loadingCupons ? (
                <Text style={styles.loadingText}>Carregando...</Text>
              ) : cuponsResgatados.length > 0 ? (
                cuponsResgatados.map((resgate) => (
                  <View key={resgate.id} style={styles.resgateCard}>
                    {userInfo?.tipo_usuario_id === 2 ? (
                      <>
                        <Text style={styles.resgateCampanha}>
                          {resgate.cupom?.campanha?.nome || `Cupom ${resgate.cupom_id}`}
                        </Text>
                        <Text style={styles.resgateUsuario}>
                          Usuário: {resgate.usuario?.nome}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.resgateCampanha}>
                          {resgate.cupom?.campanha?.nome || `Cupom ${resgate.cupom_id}`}
                        </Text>
                        <Text style={styles.resgateParceiro}>
                          Parceiro: {resgate.cupom?.parceiro?.nome || 'N/A'}
                        </Text>
                      </>
                    )}
                    <Text style={styles.resgateData}>
                      Resgatado em: {new Date(resgate.data_resgate).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noCuponsText}>
                  {userInfo?.tipo_usuario_id === 2 ? 'Nenhum cupom resgatado' : 'Nenhum cupom resgatado ainda'}
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderQRCodeModal = () => (
    <Modal
      visible={showQRCode}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowQRCode(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.qrCodeModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seu QR Code</Text>
            <TouchableOpacity 
              onPress={() => setShowQRCode(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.qrCodeContent}>
            <QRCode
              value={userInfo?.id?.toString() || ''}
              size={200}
              color="#000"
              backgroundColor="#fff"
            />
            r

            <Text style={styles.qrCodeInfo}>
              Nome: {userInfo?.nome}
            </Text>

          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={["#c83349", "#0f142c"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerBack}
    >
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#000000ff" />
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Área do Usuário</Text>

        <View style={styles.content}>
          {userInfo ? (
            <View style={styles.card}>
              <InfoRow
                icon="account-circle-outline"
                label="Nome"
                value={userInfo.nome}
              />
              <InfoRow 
                icon="email-outline" 
                label="Email" 
                value={userInfo.email} 
              />
              <InfoRow
                icon="card-account-details-outline"
                label="CPF"
                value={userInfo.cpf}
              />
              <InfoRow 
                icon="gender-male-female" 
                label="Sexo" 
                value={userInfo.sexo} 
              />
              <InfoRow
                icon="calendar-month-outline"
                label="Membro desde"
                value={new Date(userInfo.data_criacao).toLocaleDateString("pt-BR")}
              />
              <InfoRow
                icon="shield-account-outline"
                label="Tipo de Usuário"
                value={getTipoUsuarioText(userInfo.tipo_usuario_id)}
              />
            </View>
          ) : (
            <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
          )}

          {/* QR Code para usuários comuns e admins */}
          {renderQRCode()}

          {/* Leitor de QR para parceiros */}
          {renderLeitorQR()}

          {/* Botão de Cupons */}
          <TouchableOpacity 
            style={styles.cupom}
            onPress={() => setShowCupons(true)}
          >
            <Text style={styles.cupomtext}>Meus Cupons</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modais */}
      {renderCuponsModal()}
      {renderQRCodeModal()}
    </LinearGradient>
  );
};

export default AreaUsuario;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  containerBack: {
    flex: 1,
  },
  header: {
    height: 150,
    paddingTop: 40,
  },
  headerTitle: {
    height: 150,
    paddingTop: 40,
    justifyContent: "center",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    borderRadius: 15,
    padding: 25,
    width: "100%",
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    color: "#fff",
  },
  icon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffffff",
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: "#ffffffff",
    flex: 1,
  },
  button: {
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#ffffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 30,
    marginLeft: 15,
    alignSelf: "flex-start",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#000000ff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  loadingText: {
    fontSize: 18,
    color: "#555",
    marginTop: 50,
  },
  cupom: {
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#ffffffff",
    paddingHorizontal: 100,
    paddingVertical: 20,
    borderRadius: 12,
    marginTop: 30,
    marginLeft: 15,
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cupomtext: {
    justifyContent: "center",
    flexDirection: "row",
    fontSize: 20,
    textAlign: "center",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  qrCodeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  qrCodeSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 20,
  },
  qrCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  qrCodeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  leitorContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  leitorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  leitorSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 20,
  },
  leitorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  leitorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: Dimensions.get("window").width * 0.8,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    width: "100%",
  },
  cuponsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cupomCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  cupomNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cupomDescricao: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cupomQuantidade: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 5,
  },
  cupomValidade: {
    fontSize: 14,
    color: "#666",
  },
  resgateCard: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  resgateCampanha: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  resgateUsuario: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  resgateParceiro: {
    fontSize: 14,
    color: "#555",
  },
  resgateData: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  noCuponsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  qrCodeModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: Dimensions.get("window").width * 0.8,
    alignItems: "center",
  },
  qrCodeContent: {
    marginTop: 20,
    alignItems: "center",
  },
  qrCodeInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
});
