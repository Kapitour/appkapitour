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
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../lib/supabase";
import {
  buscarCuponsDisponiveis,
  buscarCuponsResgatados,
  buscarHistoricoResgates,
  atualizarUsuario,
} from "../utils/cupomManager";

const AreaUsuario = () => {
  const navigation = useNavigation();
  const { userInfo, signOut, user } = useAuth(); // Adicionei 'user' do AuthContext
  const [showQRCode, setShowQRCode] = useState(false);
  const [showCupons, setShowCupons] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState([]);
  const [cuponsResgatados, setCuponsResgatados] = useState([]);
  const [loadingCupons, setLoadingCupons] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [sexo, setSexo] = useState("");
  const [loading, setLoading] = useState(true);
  const [tipoUsuarioId, setTipoUsuarioId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserInfo();
    } else {
      setLoading(false);
      Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
      signOut();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    if (!user || !user.id) {
      Alert.alert("Erro", "Usuário não autenticado.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", user.id) // ✅ buscar pelo vínculo com Supabase Auth
        .single();

      if (error) {
        console.error("Erro ao buscar informações do usuário:", error);
        Alert.alert(
          "Erro",
          "Não foi possível buscar as informações do usuário."
        );
        return;
      }

      if (!data) {
        Alert.alert("Erro", "Nenhum usuário encontrado.");
        return;
      }

      // Atualize os estados com as informações do usuário
      setNome(data.nome);
      setEmail(data.email);
      setCpf(data.cpf);
      setSexo(data.sexo);
      setTipoUsuarioId(data.tipo_usuario_id);

      // Se você precisa manter userInfo atualizado, pode precisar atualizar o contexto
    } catch (err) {
      console.error("Erro inesperado:", err);
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.tipo_usuario_id === 2) {
      fetchCupons();
    } else if (
      userInfo?.tipo_usuario_id === 1 ||
      userInfo?.tipo_usuario_id === 3
    ) {
      fetchHistoricoResgates();
    }
  }, [userInfo]);

  const fetchCupons = async () => {
    try {
      setLoadingCupons(true);
      const [cuponsResult, resgatadosResult] = await Promise.all([
        buscarCuponsDisponiveis(userInfo.id),
        buscarCuponsResgatados(userInfo.id),
      ]);

      if (cuponsResult.success) {
        setCuponsDisponiveis(cuponsResult.data);
      }

      if (resgatadosResult.success) {
        setCuponsResgatados(resgatadosResult.data);
      }
    } catch (error) {
      console.error("Erro ao buscar cupons:", error);
      Alert.alert("Erro", "Não foi possível carregar os cupons");
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
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoadingCupons(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
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
    ]);
  };

  const getTipoUsuarioText = (tipoId) => {
    switch (tipoId) {
      case 1:
        return "Administrador";
      case 2:
        return "Parceiro";
      case 3:
        return "Usuário Comum";
      default:
        return "Desconhecido";
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
      <Text style={styles.infoValue}>{value || "Não informado"}</Text>
    </View>
  );

  const renderQRCode = () => {
    if (tipoUsuarioId !== 1 && tipoUsuarioId !== 3) {
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
        <Text style={styles.leitorSubtitle}>
          Escaneie QR Codes dos usuários
        </Text>
        <TouchableOpacity
          style={styles.leitorButton}
          onPress={() => navigation.navigate("LeitorQR")}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
          <Text style={styles.leitorButtonText}>Abrir Leitor</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleUpdateUser = async () => {
    if (!user || !user.id) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    const updatedUser = {
      nome,
      email,
      cpf,
      sexo,
    };

    try {
      const result = await atualizarUsuario(user.id, updatedUser);
      if (result.success) {
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        setShowEditModal(false);
        // Recarregar os dados do usuário
        fetchUserInfo();
      } else {
        Alert.alert("Erro", result.error);
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      Alert.alert("Erro", "Ocorreu um erro ao atualizar os dados.");
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Cadastro</Text>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={cpf}
            onChangeText={setCpf}
          />
          <TextInput
            style={styles.input}
            placeholder="Sexo"
            value={sexo}
            onChangeText={setSexo}
          />

          <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
            {loadingCupons ? (
              <Text style={styles.loadingText}>Carregando...</Text>
            ) : cuponsResgatados.length > 0 ? (
              cuponsResgatados.map((resgate) => (
                <View key={resgate.id} style={styles.resgateCard}>
                  <Text style={styles.resgateCampanha}>
                    {resgate.cupom?.campanha?.nome ||
                      `Cupom ${resgate.cupom_id}`}
                  </Text>
                  <Text style={styles.resgateData}>
                    Resgatado em:{" "}
                    {new Date(resgate.data_resgate).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noCuponsText}>
                Nenhum cupom resgatado ainda
              </Text>
            )}
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
              value={user?.id || ""}
              size={200}
              color="#000"
              backgroundColor="#fff"
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={["#c83349", "#0f142c"]}
        style={styles.containerBack}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient
        colors={["#c83349", "#0f142c"]}
        style={styles.containerBack}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Usuário não autenticado</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#c83349", "#0f142c"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerBack}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 , paddingTop:40 }}
      >

        <Text style={styles.headerTitle}>Área do Usuário</Text>

        <View style={styles.content}>
          <View style={styles.card}>
            <InfoRow icon="account-circle-outline" label="Nome" value={nome} />
            <InfoRow icon="email-outline" label="Email" value={email} />
            <InfoRow
              icon="card-account-details-outline"
              label="CPF"
              value={cpf}
            />
            <InfoRow
              icon="shield-account-outline"
              label="Tipo de Usuário"
              value={
                tipoUsuarioId
                  ? getTipoUsuarioText(tipoUsuarioId)
                  : "Não definido"
              }
            />
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#333" />
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
          </View>

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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modais */}
      {renderCuponsModal()}
      {renderQRCodeModal()}
      {renderEditModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  containerBack: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  headerTitle: {
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
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  button: {
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 30,
    alignSelf: "flex-start",
    elevation: 3,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
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
  backgroundColor: "#ffffff",
  paddingVertical: 15,
  paddingHorizontal: 40,
  borderRadius: 12,
  marginTop: 30,
  alignSelf: "center",
  elevation: 3,
},

cupomtext: {
  fontSize: 18,
  fontWeight: "bold",
  textAlign: "center",
},
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
    padding: 20,
    backgroundColor: "#fff", // deixa o fundo do card branco
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // para Android
  },

  qrCodeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#c83349", // cor do destaque, combina com seu gradiente
    marginBottom: 5,
    textAlign: "center",
  },

  qrCodeSubtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  qrCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c83349",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  qrCodeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
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
    marginBottom: 50,
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
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalBody: {
    width: "100%",
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
  logoutButton: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#c83349", // vermelho padrão do app
  paddingVertical: 15,
  paddingHorizontal: 40,
  borderRadius: 12,
  marginTop: 20,
  alignSelf: "center",
  elevation: 3,
},

logoutButtonText: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
  marginLeft: 10,
},
});

export default AreaUsuario;
