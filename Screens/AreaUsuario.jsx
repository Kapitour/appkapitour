import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Animated,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
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
import PointDetail from "../components/PointDetail";
import DetalhesRota from "./DetalhesRotas";

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
  const [favoritos, setFavoritos] = useState([]);
  const [rotasFavoritas, setRotasFavoritas] = useState([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showPointDetail, setShowPointDetail] = useState(false);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [selectedPonto, setSelectedPonto] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Estado para expandir/colapsar card de informações
  const [cardExpanded, setCardExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Carregar info do usuário
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
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
          Alert.alert(
            "Erro",
            "Não foi possível buscar as informações do usuário."
          );
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

  // Animação de entrada do card
  useEffect(() => {
    if (userInfo && !loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [userInfo, loading]);

  // Animação de expansão/colapso
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: cardExpanded ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [cardExpanded]);

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

        const contagemResult = await buscarContagemCuponsPorCampanha(
          userInfo.id
        );
        if (contagemResult.success) setContagemCampanhas(contagemResult.data);
      } else if (
        userInfo.tipo_usuario_id === 1 ||
        userInfo.tipo_usuario_id === 3
      ) {
        // Admin ou usuário comum: cupons disponíveis e resgatados
        const [cuponsResult, resgatadosResult] = await Promise.all([
          buscarCuponsDisponiveis(),
          buscarCuponsResgatados(userInfo.id),
        ]);
        if (cuponsResult.success) setCuponsDisponiveis(cuponsResult.data);
        if (resgatadosResult.success)
          setCuponsResgatados(resgatadosResult.data);
      }
    } catch (error) {
      console.error("Erro ao buscar cupons:", error);
    } finally {
      setLoadingCupons(false);
    }
  };

  // Função para buscar favoritos do usuário (pontos turísticos)
  const fetchFavoritos = async () => {
    if (!userInfo) return;
    setLoadingFavoritos(true);
    try {
      // Buscar favoritos do usuário
      const { data, error } = await supabase
        .from("favoritos")
        .select(
          `
          id,
          ponto_id,
          data_adicionado,
          pontos_turisticos:ponto_id (
            id,
            nome,
            descricao,
            url_img,
            latitude,
            longitude
          )
        `
        )
        .eq("usuario_id", userInfo.id);

      if (error) {
        console.error("Erro ao buscar favoritos:", error);
        return;
      }

      setFavoritos(data || []);
    } catch (err) {
      console.error("Erro inesperado ao buscar favoritos:", err);
    } finally {
      setLoadingFavoritos(false);
    }
  };

  // Função para buscar rotas favoritas (guias)
  const fetchRotasFavoritas = async () => {
    if (!userInfo) return;

    try {
      // Buscar pontos favoritos do usuário
      const { data: favoritosData, error: favoritosError } = await supabase
        .from("favoritos")
        .select("ponto_id")
        .eq("usuario_id", userInfo.id);

      if (favoritosError) {
        console.error("Erro ao buscar favoritos:", favoritosError);
        return;
      }

      const pontosFavoritos = favoritosData?.map((f) => f.ponto_id) || [];

      if (pontosFavoritos.length === 0) {
        setRotasFavoritas([]);
        return;
      }

      // Buscar rotas que contêm pontos favoritos
      const { data: rotaPontoData, error: rotaPontoError } = await supabase
        .from("rota_ponto")
        .select("rota_id, ponto_id, ordem")
        .in("ponto_id", pontosFavoritos);

      if (rotaPontoError) {
        console.error("Erro ao buscar rota_ponto:", rotaPontoError);
        return;
      }

      // Agrupar por rota_id
      const rotasIds = [
        ...new Set(rotaPontoData?.map((rp) => rp.rota_id) || []),
      ];

      if (rotasIds.length === 0) {
        setRotasFavoritas([]);
        return;
      }

      // Buscar informações das rotas
      const { data: rotasData, error: rotasError } = await supabase
        .from("rotas")
        .select("id, nome, descricao")
        .in("id", rotasIds);

      if (rotasError) {
        console.error("Erro ao buscar rotas:", rotasError);
        return;
      }

      // Para cada rota, buscar imagem do primeiro ponto
      const rotasCompletas = await Promise.all(
        rotasData.map(async (rota) => {
          // Buscar pontos da rota ordenados
          const { data: pontosRota, error: pontosError } = await supabase
            .from("rota_ponto")
            .select("ponto_id, ordem")
            .eq("rota_id", rota.id)
            .order("ordem", { ascending: true });

          if (pontosError || !pontosRota || pontosRota.length === 0) {
            return { ...rota, imagem: null, pontoId: null };
          }

          const primeiroPontoId = pontosRota[0].ponto_id;

          // Buscar imagem do primeiro ponto
          const { data: primeiroPonto, error: pontoError } = await supabase
            .from("pontos_turisticos")
            .select("url_img")
            .eq("id", primeiroPontoId)
            .single();

          return {
            ...rota,
            imagem: primeiroPonto?.url_img || null,
            pontoId: primeiroPontoId,
          };
        })
      );

      setRotasFavoritas(rotasCompletas);
    } catch (err) {
      console.error("Erro inesperado ao buscar rotas favoritas:", err);
    }
  };

  // Ao mudar userInfo, carregar listas
  useEffect(() => {
    fetchCuponsOuHistorico();
    fetchFavoritos();
    fetchRotasFavoritas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  // Ao voltar para a tela, atualizar listas (após resgates)
  useFocusEffect(
    React.useCallback(() => {
      fetchCuponsOuHistorico();
      fetchFavoritos();
      fetchRotasFavoritas();
    }, [userInfo])
  );

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

  // Função para abrir modal de detalhes do ponto turístico
  const handlePointPress = (favorito) => {
    const point = {
      id: favorito.pontos_turisticos.id,
      nome: favorito.pontos_turisticos.nome,
      descricao: favorito.pontos_turisticos.descricao,
      url_img: favorito.pontos_turisticos.url_img,
      latitude: favorito.pontos_turisticos.latitude,
      longitude: favorito.pontos_turisticos.longitude,
    };
    setSelectedPoint(point);
    setShowPointDetail(true);
  };

  // Função para fechar modal de detalhes
  const handleClosePointDetail = () => {
    setShowPointDetail(false);
    setSelectedPoint(null);
  };

  // Função para lidar com favoritos no modal
  const handleFavoriteToggle = async () => {
    // Atualizar lista de favoritos após mudança
    fetchFavoritos();
    fetchRotasFavoritas();
  };

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

  // Se uma rota foi selecionada, mostrar DetalhesRota
  if (rotaSelecionada) {
    return (
      <DetalhesRota
        rota={rotaSelecionada}
        voltar={() => setRotaSelecionada(null)}
      />
    );
  }

  if (showPointDetail) {
    return (
      <PointDetail
        point={selectedPonto}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPonto(null);
          setRotaCoords([]);
        }}
      />
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
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 40 }}
      >
        <Text style={styles.headerTitle}>Área do Usuário</Text>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            {/* Header do Card com Gradiente */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setCardExpanded(!cardExpanded)}
            >
              <LinearGradient
                colors={["#c83349", "#a12a3a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardHeader}
              >
                <View style={styles.cardHeaderContent}>
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={cardExpanded ? 50 : 60}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.userInfoHeader}>
                    <Text style={styles.userName}>{nome || "Usuário"}</Text>
                    <Text style={styles.userType}>
                      {getTipoUsuarioText(tipoUsuarioId)}
                    </Text>
                  </View>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: expandAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "180deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={24}
                      color="#fff"
                      style={{ opacity: 0.9 }}
                    />
                  </Animated.View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Conteúdo do Card - Expansível */}
            <Animated.View
              style={{
                maxHeight: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 250],
                }),
                opacity: expandAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.5, 1],
                }),
                overflow: "hidden",
              }}
            >
              <View style={styles.cardBody}>
                <View style={styles.infoSection}>
                  <InfoRow 
                    icon="email-outline" 
                    label="Email" 
                    value={email}
                    iconColor="#c83349"
                  />
                  <View style={styles.divider} />
                  <InfoRow
                    icon="card-account-details-outline"
                    label="CPF"
                    value={cpf}
                    iconColor="#c83349"
                  />
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setShowEditModal(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#c83349", "#a12a3a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.editButtonGradient}
                  >
                    <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>

          {tipoUsuarioId === 1 || tipoUsuarioId === 3 ? (
            <Animated.View
              style={[
                styles.qrCodeContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                style={styles.qrCodeCard}
              >
                <View style={styles.qrCodeIconWrapper}>
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={40}
                    color="#fff"
                  />
                </View>
                <Text style={styles.qrCodeTitle}>Seu QR Code</Text>
                <Text style={styles.qrCodeSubtitle}>
                  Apresente para parceiros
                </Text>
                <TouchableOpacity
                  style={styles.qrCodeButton}
                  onPress={() => setShowQRCode(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.qrCodeButtonText}>Ver QR Code</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          ) : null}

          {tipoUsuarioId === 2 && (
            <Animated.View
              style={[
                styles.leitorContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                style={styles.leitorCard}
              >
                <View style={styles.leitorIconWrapper}>
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={40}
                    color="#fff"
                  />
                </View>
                <Text style={styles.leitorTitle}>Leitor de QR Code</Text>
                <Text style={styles.leitorSubtitle}>
                  Escaneie QR Codes dos usuários
                </Text>
                <TouchableOpacity
                  style={styles.leitorButton}
                  onPress={() => navigation.navigate("LeitorQR")}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.leitorButtonText}>Abrir Leitor</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          <View style={styles.actionsContainer}>
            {tipoUsuarioId === 2 ? (
              <TouchableOpacity
                style={styles.cupom}
                onPress={() => setShowCampanhas(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#c83349", "#a12a3a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cupomGradient}
                >
                  <MaterialCommunityIcons
                    name="ticket-percent"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.cupomtext}>Minhas Campanhas</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cupom}
                onPress={() => setShowCupons(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#c83349", "#a12a3a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cupomGradient}
                >
                  <MaterialCommunityIcons
                    name="ticket-percent"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.cupomtext}>Meus Cupons</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Acesso a Contato dentro da Área do Usuário */}
            <TouchableOpacity
              style={styles.cupom}
              onPress={() => navigation.navigate("Contato")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#c83349", "#a12a3a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cupomGradient}
              >
                <MaterialCommunityIcons
                  name="headset"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.cupomtext}>Contato e Suporte</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#a12a3a", "#8a1f2d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoutButtonGradient}
              >
                <MaterialCommunityIcons name="logout" size={20} color="#fff" />
                <Text style={styles.logoutButtonText}>Sair</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Rotas Favoritas */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Guias Favoritos</Text>

          {loadingFavoritos ? (
            <Text style={styles.loadingText}>
              Carregando rotas favoritas...
            </Text>
          ) : rotasFavoritas.length === 0 ? (
            <Text style={styles.emptyText}>
              Você ainda não tem rotas favoritas.
            </Text>
          ) : (
            <View style={styles.favoritosContainer}>
              {rotasFavoritas.map((rota) => (
                <TouchableOpacity
                  key={rota.id}
                  style={styles.favoritoCard}
                  onPress={() => setRotaSelecionada(rota)}
                >
                  <Image
                    source={{
                      uri: rota.imagem || "https://via.placeholder.com/150",
                    }}
                    style={styles.favoritoImagem}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.favoritoGradient}
                  >
                    <Text style={styles.favoritoNome}>{rota.nome}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Seção de Pontos Turísticos Favoritos */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pontos Turísticos Favoritos</Text>

          {loadingFavoritos ? (
            <Text style={styles.loadingText}>Carregando favoritos...</Text>
          ) : favoritos.length === 0 ? (
            <Text style={styles.emptyText}>
              Você ainda não tem pontos turísticos favoritos.
            </Text>
          ) : (
            <View style={styles.favoritosContainer}>
              {favoritos.map((favorito) => (
                <TouchableOpacity
                  key={favorito.id}
                  style={styles.favoritoCard}
                  onPress={() => handlePointPress(favorito)}
                >
                  <Image
                    source={{
                      uri:
                        favorito.pontos_turisticos.url_img ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.favoritoImagem}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.favoritoGradient}
                  >
                    <Text style={styles.favoritoNome}>
                      {favorito.pontos_turisticos.nome}
                    </Text>
                  </LinearGradient>
                  <TouchableOpacity
                    style={styles.removerFavoritoBtn}
                    onPress={async () => {
                      try {
                        const { error } = await supabase
                          .from("favoritos")
                          .delete()
                          .eq("id", favorito.id);

                        if (error) throw error;
                        fetchFavoritos(); // Atualizar lista após remover
                      } catch (err) {
                        console.error("Erro ao remover favorito:", err);
                        Alert.alert(
                          "Erro",
                          "Não foi possível remover o favorito."
                        );
                      }
                    }}
                  >
                    <Ionicons name="heart-dislike" size={20} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={{ height: 80 }} />

      {renderCuponsModal()}
      {renderCampanhasModal()}
      {renderQRCodeModal()}
      {renderEditModal()}

      {/* Modal de detalhes do ponto turístico */}
      {showPointDetail && selectedPoint && (
        <PointDetail
          point={selectedPoint}
          visible={showPointDetail}
          onClose={handleClosePointDetail}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}
    </LinearGradient>
  );

  function InfoRow({ icon, label, value, iconColor = "#c83349" }) {
    return (
      <View style={styles.infoRow}>
        <View style={[styles.iconContainer, { backgroundColor: "rgba(200, 51, 73, 0.15)" }]}>
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={iconColor}
          />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value || "Não informado"}</Text>
        </View>
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
              ) : (
                <>
                  {(tipoUsuarioId === 1 || tipoUsuarioId === 3) && (
                    <>
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          marginBottom: 8,
                        }}
                      >
                        Disponíveis
                      </Text>
                      {cuponsDisponiveis.length > 0 ? (
                        cuponsDisponiveis.map((cupom) => (
                          <View key={cupom.id} style={styles.resgateCard}>
                            <Text style={styles.resgateCampanha}>
                              {cupom.campanha?.nome ||
                                cupom.codigo ||
                                `Cupom ${cupom.id}`}
                            </Text>
                            <Text style={styles.resgateValidade}>
                              Validade: {cupom.data_validade || "-"}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.loadingText}>
                          Nenhum cupom disponível
                        </Text>
                      )}
                    </>
                  )}

                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginTop: 16,
                      marginBottom: 8,
                    }}
                  >
                    Resgatados
                  </Text>
                  {cuponsResgatados.length > 0 ? (
                    cuponsResgatados.map((resgate) => (
                      <View key={resgate.id} style={styles.resgateCard}>
                        <Text style={styles.resgateCampanha}>
                          {resgate.cupom?.campanha?.nome ||
                            resgate.cupom?.codigo ||
                            `Cupom ${resgate.id}`}
                        </Text>
                        <Text style={styles.resgateValidade}>
                          Validade: {resgate.cupom?.data_validade || "-"}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.loadingText}>
                      Nenhum cupom resgatado
                    </Text>
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
              <TouchableOpacity
                onPress={() => setShowCampanhas(false)}
                style={styles.closeButton}
              >
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
                    {camp.descricao ? (
                      <Text style={styles.resgateValidade}>
                        {camp.descricao}
                      </Text>
                    ) : null}
                    <Text style={styles.resgateValidade}>
                      {camp.data_inicio ? `Início: ${camp.data_inicio}` : ""}
                      {camp.data_fim ? `  Fim: ${camp.data_fim}` : ""}
                    </Text>
                    <Text style={styles.resgateValidade}>
                      Status: {camp.ativa ? "Ativa" : "Inativa"}
                    </Text>
                    <Text style={styles.resgateValidade}>
                      Disponíveis: {contagemCampanhas[camp.id] ?? 0}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.loadingText}>
                  Nenhuma campanha encontrada.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  function renderQRCodeModal() {
    return (
      <Modal
        visible={showQRCode}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowQRCode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <QRCode value={userInfo?.auth_id || ""} size={200} />
            <TouchableOpacity
              onPress={() => setShowQRCode(false)}
              style={styles.closeButtonQRCode}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function renderEditModal() {
    return (
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
            />
            <TextInput
              style={styles.input}
              value={sexo}
              onChangeText={setSexo}
              placeholder="Sexo"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() =>
                atualizarUsuario(userInfo?.auth_id, { nome, email, cpf, sexo })
              }
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEditModal(false)}
            >
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
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  content: { paddingHorizontal: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    padding: 20,
    paddingVertical: 18,
  },
  cardHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfoHeader: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  cardBody: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
    marginLeft: 56,
  },
  editButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  editButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  editButtonText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonText: { marginLeft: 5, color: "#333", fontWeight: "bold" },
  actionsContainer: {
    marginBottom: 20,
  },
  qrCodeContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  qrCodeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
  },
  qrCodeIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  qrCodeTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
  },
  qrCodeSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  qrCodeButton: {
    flexDirection: "row",
    backgroundColor: "#c83349",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  qrCodeButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  leitorContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  leitorCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
  },
  leitorIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  leitorTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
  },
  leitorSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  leitorButton: {
    flexDirection: "row",
    backgroundColor: "#c83349",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  leitorButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  cupom: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cupomGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cupomtext: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
  },
  logoutButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: { fontWeight: "bold", fontSize: 18 },
  closeButton: { padding: 5 },
  modalBody: { maxHeight: 300 },
  resgateCard: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  resgateCampanha: { fontWeight: "bold" },
  resgateValidade: { fontSize: 12 },
  loadingText: { textAlign: "center", marginTop: 20 },
  qrModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonQRCode: { position: "absolute", top: 10, right: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  saveButton: {
    backgroundColor: "#c83349",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontWeight: "bold", marginBottom: 10 },
  sectionContainer: { marginTop: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    width: "58%", // A largura do componente será 50%
    textAlign: "left", // Alinha o texto à esquerda
    backgroundColor: "aqua-marine",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fff",
    marginLeft: 10, // Sem margem à esquerda
    marginRight: "auto", // Empurra para a esquerda
  },
  
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
  favoritosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  favoritoCard: {
    width: "48%",
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },
  favoritoImagem: { width: "100%", height: "100%", resizeMode: "cover" },
  favoritoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: 10,
  },
  favoritoNome: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  removerFavoritoBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(200, 51, 73, 0.8)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AreaUsuario;
