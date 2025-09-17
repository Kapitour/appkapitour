import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../hooks/useAuth";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../lib/supabase";
import {
  buscarCuponsDisponiveis,
  buscarCuponsResgatados,
  buscarHistoricoResgates,
  buscarCampanhasDoParceiro,
  buscarContagemCuponsPorCampanha,
  atualizarUsuario,
} from "../utils/cupomManager";

const AreaUsuario = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [userInfo, setUserInfo] = useState(null);

  const [showQRCode, setShowQRCode] = useState(false);
  const [showCupons, setShowCupons] = useState(false);
  const [showCampanhas, setShowCampanhas] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [cuponsDisponiveis, setCuponsDisponiveis] = useState([]);
  const [cuponsResgatados, setCuponsResgatados] = useState([]);
  const [campanhasParceiro, setCampanhasParceiro] = useState([]);
  const [contagemCampanhas, setContagemCampanhas] = useState({});
  const [loadingCupons, setLoadingCupons] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [sexo, setSexo] = useState("");
  const [loading, setLoading] = useState(true);
  const [tipoUsuarioId, setTipoUsuarioId] = useState(null);

  // Carregar info do usuário
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("auth_id", user.id) // ✅ usar auth_id
          .single();

        if (error || !data) {
          console.error("Erro ao buscar informações do usuário:", error);
          Alert.alert("Erro", "Não foi possível buscar as informações do usuário.");
          return;
        }

        setUserInfo(data);
        setNome(data.nome);
        setEmail(data.email);
        setCpf(data.cpf);
        setSexo(data.sexo);
        setTipoUsuarioId(data.tipo_usuario_id);

      } catch (err) {
        console.error("Erro inesperado:", err);
        Alert.alert("Erro", "Ocorreu um erro inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  const fetchCuponsOuHistorico = async () => {
    if (!userInfo) return;
      setLoadingCupons(true);
      try {
        if (userInfo.tipo_usuario_id === 2) {
          // Parceiro: histórico de cupons resgatados + campanhas
          const historicoResult = await buscarHistoricoResgates(userInfo.id); // filtra pelo id da tabela usuarios
          if (historicoResult.success) setCuponsResgatados(historicoResult.data);

          const campanhasResult = await buscarCampanhasDoParceiro(userInfo.id);
          if (campanhasResult.success) setCampanhasParceiro(campanhasResult.data);

          const contagemResult = await buscarContagemCuponsPorCampanha(userInfo.id);
          if (contagemResult.success) setContagemCampanhas(contagemResult.data);
        } else if (userInfo.tipo_usuario_id === 1 || userInfo.tipo_usuario_id === 3) {
          // Admin ou usuário comum: cupons disponíveis e resgatados
          const [cuponsResult, resgatadosResult] = await Promise.all([
            buscarCuponsDisponiveis(),
            buscarCuponsResgatados(userInfo.id),
          ]);
          if (cuponsResult.success) setCuponsDisponiveis(cuponsResult.data);
          if (resgatadosResult.success) setCuponsResgatados(resgatadosResult.data);
        }
      } catch (error) {
        console.error("Erro ao buscar cupons:", error);
      } finally {
        setLoadingCupons(false);
      }
  };

  // Ao mudar userInfo, carregar listas
  useEffect(() => {
    fetchCuponsOuHistorico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  // Ao voltar para a tela, atualizar listas (após resgates)
  useFocusEffect(
    React.useCallback(() => {
      fetchCuponsOuHistorico();
    }, [userInfo])
  );

  const getTipoUsuarioText = (tipoId) => {
    switch (tipoId) {
      case 1: return "Administrador";
      case 2: return "Parceiro";
      case 3: return "Usuário Comum";
      default: return "Desconhecido";
    }
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          const result = await signOut();
          if (!result.success) Alert.alert("Erro ao sair", result.error);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <LinearGradient colors={["#c83349", "#0f142c"]} style={styles.containerBack}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={["#c83349", "#0f142c"]} style={styles.containerBack}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Usuário não autenticado</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
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
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 40 }}>
        <Text style={styles.headerTitle}>Área do Usuário</Text>

        <View style={styles.content}>
          <View style={styles.card}>
            <InfoRow icon="account-circle-outline" label="Nome" value={nome} />
            <InfoRow icon="email-outline" label="Email" value={email} />
            <InfoRow icon="card-account-details-outline" label="CPF" value={cpf} />
            <InfoRow icon="shield-account-outline" label="Tipo" value={getTipoUsuarioText(tipoUsuarioId)} />

            <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
              <MaterialCommunityIcons name="pencil" size={20} color="#333" />
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
          </View>

          {tipoUsuarioId === 1 || tipoUsuarioId === 3 ? (
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrCodeTitle}>Seu QR Code</Text>
              <Text style={styles.qrCodeSubtitle}>Apresente para parceiros</Text>
              <TouchableOpacity style={styles.qrCodeButton} onPress={() => setShowQRCode(true)}>
                <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
                <Text style={styles.qrCodeButtonText}>Ver QR Code</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {tipoUsuarioId === 2 && (
            <View style={styles.leitorContainer}>
              <Text style={styles.leitorTitle}>Leitor de QR Code</Text>
              <Text style={styles.leitorSubtitle}>Escaneie QR Codes dos usuários</Text>
              <TouchableOpacity
                style={styles.leitorButton}
                onPress={() => navigation.navigate("LeitorQR")}
              >
                <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
                <Text style={styles.leitorButtonText}>Abrir Leitor</Text>
              </TouchableOpacity>
            </View>
          )}

          {tipoUsuarioId === 2 ? (
            <TouchableOpacity style={styles.cupom} onPress={() => setShowCampanhas(true)}>
              <Text style={styles.cupomtext}>Minhas Campanhas</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cupom} onPress={() => setShowCupons(true)}>
              <Text style={styles.cupomtext}>Meus Cupons</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderCuponsModal()}
      {renderCampanhasModal()}
      {renderQRCodeModal()}
      {renderEditModal()}
    </LinearGradient>
  );

  function InfoRow({ icon, label, value }) {
    return (
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name={icon} size={24} color="#333" style={styles.icon} />
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value || "Não informado"}</Text>
      </View>
    );
  }

  function renderCuponsModal() {
    return (
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
              <TouchableOpacity onPress={() => setShowCupons(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingCupons ? (
                <Text style={styles.loadingText}>Carregando...</Text>
              ) : (
                <>
                  {(tipoUsuarioId === 1 || tipoUsuarioId === 3) && (
                    <>
                      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
                        Disponíveis
                      </Text>
                      {cuponsDisponiveis.length > 0 ? (
                        cuponsDisponiveis.map((cupom) => (
                          <View key={cupom.id} style={styles.resgateCard}>
                            <Text style={styles.resgateCampanha}>
                              {cupom.campanha?.nome || cupom.codigo || `Cupom ${cupom.id}`}
                            </Text>
                            <Text style={styles.resgateValidade}>
                              Validade: {cupom.data_validade || "-"}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.loadingText}>Nenhum cupom disponível</Text>
                      )}
                    </>
                  )}

                  <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 16, marginBottom: 8 }}>
                    Resgatados
                  </Text>
                  {cuponsResgatados.length > 0 ? (
                    cuponsResgatados.map((resgate) => (
                      <View key={resgate.id} style={styles.resgateCard}>
                        <Text style={styles.resgateCampanha}>
                          {resgate.cupom?.campanha?.nome || resgate.cupom?.codigo || `Cupom ${resgate.id}`}
                        </Text>
                        <Text style={styles.resgateValidade}>
                          Validade: {resgate.cupom?.data_validade || "-"}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.loadingText}>Nenhum cupom resgatado</Text>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  function renderCampanhasModal() {
    return (
      <Modal
        visible={showCampanhas}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCampanhas(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Minhas Campanhas</Text>
              <TouchableOpacity onPress={() => setShowCampanhas(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingCupons ? (
                <Text style={styles.loadingText}>Carregando...</Text>
              ) : campanhasParceiro.length > 0 ? (
                campanhasParceiro.map((camp) => (
                  <View key={camp.id} style={styles.resgateCard}>
                    <Text style={styles.resgateCampanha}>{camp.nome}</Text>
                    {camp.descricao ? <Text style={styles.resgateValidade}>{camp.descricao}</Text> : null}
                    <Text style={styles.resgateValidade}>
                      {camp.data_inicio ? `Início: ${camp.data_inicio}` : ''}
                      {camp.data_fim ? `  Fim: ${camp.data_fim}` : ''}
                    </Text>
                    <Text style={styles.resgateValidade}>Status: {camp.ativa ? 'Ativa' : 'Inativa'}</Text>
                    <Text style={styles.resgateValidade}>
                      Disponíveis: {contagemCampanhas[camp.id] ?? 0}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.loadingText}>Nenhuma campanha encontrada.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  function renderQRCodeModal() {
    return (
      <Modal visible={showQRCode} animationType="fade" transparent={true} onRequestClose={() => setShowQRCode(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <QRCode value={userInfo?.auth_id || ""} size={200} />
            <TouchableOpacity onPress={() => setShowQRCode(false)} style={styles.closeButtonQRCode}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function renderEditModal() {
    return (
      <Modal visible={showEditModal} animationType="slide" transparent={true} onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
            <TextInput style={styles.input} value={cpf} onChangeText={setCpf} placeholder="CPF" />
            <TextInput style={styles.input} value={sexo} onChangeText={setSexo} placeholder="Sexo" />
            <TouchableOpacity style={styles.saveButton} onPress={() => atualizarUsuario(userInfo?.auth_id, { nome, email, cpf, sexo })}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowEditModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  containerBack: { flex: 1, backgroundColor: "#0f142c" },
  headerTitle: { fontSize: 24, color: "#fff", fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  content: { paddingHorizontal: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  icon: { marginRight: 10 },
  infoLabel: { fontWeight: "bold", marginRight: 5 },
  infoValue: { flex: 1 },
  editButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  buttonText: { marginLeft: 5, color: "#333", fontWeight: "bold" },
  qrCodeContainer: { marginBottom: 20, alignItems: "center" },
  qrCodeTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  qrCodeSubtitle: { color: "#fff", fontSize: 12, marginBottom: 10 },
  qrCodeButton: { flexDirection: "row", backgroundColor: "#c83349", padding: 10, borderRadius: 8, alignItems: "center" },
  qrCodeButtonText: { color: "#fff", marginLeft: 5 },
  leitorContainer: { marginBottom: 20, alignItems: "center" },
  leitorTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  leitorSubtitle: { color: "#fff", fontSize: 12, marginBottom: 10 },
  leitorButton: { flexDirection: "row", backgroundColor: "#c83349", padding: 10, borderRadius: 8, alignItems: "center" },
  leitorButtonText: { color: "#fff", marginLeft: 5 },
  cupom: { backgroundColor: "#c83349", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  cupomtext: { color: "#fff", fontWeight: "bold" },
  logoutButton: { flexDirection: "row", backgroundColor: "#a12a3a", padding: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  logoutButtonText: { color: "#fff", marginLeft: 5, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 15 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontWeight: "bold", fontSize: 18 },
  closeButton: { padding: 5 },
  modalBody: { maxHeight: 300 },
  resgateCard: { padding: 10, backgroundColor: "#eee", borderRadius: 8, marginBottom: 10 },
  resgateCampanha: { fontWeight: "bold" },
  resgateValidade: { fontSize: 12 },
  loadingText: { textAlign: "center", marginTop: 20 },
  qrModalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 12, alignItems: "center" },
  closeButtonQRCode: { position: "absolute", top: 10, right: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginVertical: 5 },
  saveButton: { backgroundColor: "#c83349", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontWeight: "bold", marginBottom: 10 },
});

export default AreaUsuario;
