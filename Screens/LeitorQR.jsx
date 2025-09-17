import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { buscarCuponsDisponiveis } from "../utils/cupomManager";

const LeitorQR = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const [showCuponsModal, setShowCuponsModal] = useState(false);
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState([]);
  const [usuarioEscaneado, setUsuarioEscaneado] = useState(null);
  const [loading, setLoading] = useState(false);

  // 👇 trava de leitura
  const [scanned, setScanned] = useState(false);

  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();

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
        Alert.alert("Erro", result.error);
      }
    } catch (error) {
      console.error("Erro ao buscar cupons:", error);
      Alert.alert("Erro", "Não foi possível carregar os cupons");
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScanned = async ({ data }) => {
    if (scanned) return; // 👈 impede leitura múltipla
    setScanned(true); // trava até o usuário fechar modal ou alerta

    try {
      setLoading(true);

      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", data)
        .single();

      if (usuarioError) throw usuarioError;

      setUsuarioEscaneado(usuario);
      setShowCuponsModal(true);
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      Alert.alert("Erro", "Não foi possível processar o QR Code", [
        {
          text: "OK",
          onPress: () => setScanned(false), // 👈 libera leitura de novo
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Precisamos da sua permissão para acessar a câmera
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={requestPermission}
        >
          <Text style={styles.scanButtonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#c83349", "#0f142c"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leitor de QR Code</Text>
      </View>

      {/* Câmera */}
      <View style={styles.content}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleQRCodeScanned} // 👈 só chama se não estiver travado
          barcodeScannerSettings={{ barCodeTypes: ["qr"] }}
        />

        <TouchableOpacity
          style={styles.flipButton}
          onPress={() =>
            setFacing((current) => (current === "back" ? "front" : "back"))
          }
        >
          <MaterialCommunityIcons name="camera-switch" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal de Cupons */}
      <Modal
        visible={showCuponsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCuponsModal(false);
          setScanned(false); // 👈 libera nova leitura quando fecha modal
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              Usuário Escaneado:
            </Text>
            {usuarioEscaneado ? (
              <Text>{usuarioEscaneado.nome}</Text>
            ) : (
              <Text>Nenhum usuário encontrado</Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowCuponsModal(false);
                setScanned(false); // 👈 libera leitura de novo
              }}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default LeitorQR;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 40,
  },
  headerTitle: { color: "#fff", fontSize: 18, marginLeft: 8 },
  content: { flex: 1 },
  camera: { flex: 1 },
  flipButton: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 50,
  },
  message: { textAlign: "center", marginTop: 50, color: "#fff" },
  scanButton: {
    alignSelf: "center",
    backgroundColor: "#c83349",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  scanButtonText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 20,
    padding: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#c83349",
    padding: 12,
    borderRadius: 8,
  },
  closeButtonText: { color: "#fff", textAlign: "center" },
});
