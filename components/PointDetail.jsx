import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const { height } = Dimensions.get("window");

const PointDetail = ({
  point,
  onClose,
  distance,
  onFavorite,
  isFavorite: propIsFavorite,
}) => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [pointRating, setPointRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(propIsFavorite);

  useEffect(() => {
    if (user?.id) {
      fetchUserInfo();
      fetchPointRating();
      checkFavoriteStatus();
    }
  }, [user, point]);

  useEffect(() => {
    setIsFavorite(propIsFavorite);
  }, [propIsFavorite]);

  // Buscar informações do usuário
  const fetchUserInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (error || !data) {
        console.error("Erro ao buscar informações do usuário:", error);
        return;
      }

      setUserInfo(data);
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };

  // Verificar status de favorito
  const checkFavoriteStatus = async () => {
    if (!user?.id || !userInfo) return;

    try {
      const { data, error } = await supabase
        .from("favoritos")
        .select("*")
        .eq("usuario_id", userInfo.id)
        .eq("ponto_id", point.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao verificar favorito:", error);
        return;
      }

      setIsFavorite(!!data);
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };

  // Alternar favorito
  const toggleFavorito = async () => {
    if (!user?.id) {
      Alert.alert(
        "Atenção",
        "Você precisa estar logado para favoritar pontos turísticos."
      );
      return;
    }

    if (!userInfo) {
      Alert.alert(
        "Erro",
        "Não foi possível obter suas informações. Tente novamente."
      );
      return;
    }

    try {
      if (isFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from("favoritos")
          .delete()
          .eq("usuario_id", userInfo.id)
          .eq("ponto_id", point.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase.from("favoritos").insert({
          usuario_id: userInfo.id,
          ponto_id: point.id,
          data_adicionado: new Date().toISOString(),
        });

        if (error) throw error;
        setIsFavorite(true);
      }

      // Notificar o componente pai sobre a mudança
      if (onFavorite) {
        onFavorite(point.id, !isFavorite);
      }
    } catch (err) {
      console.error("Erro ao atualizar favorito:", err);
      Alert.alert("Erro", "Não foi possível atualizar seus favoritos.");
    }
  };

  // Buscar avaliação média do ponto
  const fetchPointRating = async () => {
    try {
      const { data, error } = await supabase
        .from("avaliacoes")
        .select("nota")
        .eq("ponto_id", point.id);

      if (error) {
        console.error("Erro ao buscar avaliações:", error);
        return;
      }

      if (data && data.length > 0) {
        const average =
          data.reduce((sum, item) => sum + item.nota, 0) / data.length;
        setPointRating(Math.round(average));
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };

  // Salvar avaliação
  const saveRating = async () => {
    if (!user?.id || !userInfo) {
      Alert.alert(
        "Atenção",
        "Você precisa estar logado para avaliar pontos turísticos."
      );
      setShowRatingModal(false);
      return;
    }

    if (rating === 0) {
      Alert.alert(
        "Erro",
        "Por favor, selecione uma avaliação de 1 a 5 estrelas."
      );
      return;
    }

    setLoading(true);

    try {
      // Verificar se o usuário já avaliou este ponto
      const { data: existingRating } = await supabase
        .from("avaliacoes")
        .select("*")
        .eq("usuario_id", userInfo.id)
        .eq("ponto_id", point.id)
        .single();

      let result;

      if (existingRating) {
        // Atualizar avaliação existente
        result = await supabase
          .from("avaliacoes")
          .update({
            nota: rating,
            comentario: comment,
            data_avaliacao: new Date().toISOString(),
          })
          .eq("id", existingRating.id);
      } else {
        // Inserir nova avaliação
        result = await supabase.from("avaliacoes").insert([
          {
            usuario_id: userInfo.id,
            ponto_id: point.id,
            nota: rating,
            comentario: comment,
            data_avaliacao: new Date().toISOString(),
          },
        ]);
      }

      if (result.error) throw result.error;

      Alert.alert("Sucesso", "Sua avaliação foi salva com sucesso!");
      setShowRatingModal(false);
      fetchPointRating(); // Atualizar a avaliação média
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
      Alert.alert("Erro", "Não foi possível salvar sua avaliação.");
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir o Google Maps com as coordenadas do ponto
  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
    Linking.openURL(url);
  };

  // Calcula o tempo estimado (5 min por km, aproximadamente)
  const safeDistance = distance || 0;
  const estimatedTime = Math.round(safeDistance * 5);
  const hours = Math.floor(estimatedTime / 60);
  const minutes = estimatedTime % 60;
  const timeText = hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Imagem de fundo */}
      <Animated.Image
        sharedTransitionTag={`point-image-${point.id}`}
        source={{ uri: point.url_img }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Botões superiores */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorito}
        >
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={24}
            color={isFavorite ? "#f7a000" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Card de informações */}
      <Animated.View style={styles.infoCard} entering={FadeIn.duration(200)}>
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Animated.Text
              sharedTransitionTag={`point-title-${point.id}`}
              style={styles.title}
            >
              {point.nome}
            </Animated.Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsRow}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= (pointRating || point.rating || 0)
                          ? "star"
                          : "star-outline"
                      }
                      size={18}
                      color="#f7a000"
                      style={styles.starIcon}
                    />
                  ))}
                </View>

                {pointRating > 0 && (
                  <Text style={styles.ratingNumber}>
                    {pointRating.toFixed(1)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {safeDistance.toFixed(1)} km
                </Text>
                <Text style={styles.statLabel}>Distância</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{timeText}</Text>
                <Text style={styles.statLabel}>Tempo estimado</Text>
              </View>
            </View>

            <Text style={styles.description}>
              {point.descricao ||
                `${point.nome} é um local favorito entre moradores e visitantes! Este ponto turístico oferece vistas deslumbrantes e experiências únicas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
            </Text>

            {/* Espaço adicional para garantir que o conteúdo role acima dos botões fixos */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>

        <View style={styles.fixedActionButtons}>
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => {
              if (!user) {
                Alert.alert(
                  "Atenção",
                  "Você precisa estar logado para avaliar pontos turísticos."
                );
                return;
              }
              setShowRatingModal(true);
            }}
          >
            <Text style={styles.buttonText}>Avaliar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navigateButton} onPress={openInMaps}>
            <Text style={styles.buttonText}>Visitar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modal de Avaliação */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Avaliar {point.nome}</Text>

            <View style={styles.ratingStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#f7a000"
                    style={styles.ratingStarIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Deixe um comentário (opcional)"
              multiline={true}
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setComment("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={saveRating}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Salvando..." : "Enviar Avaliação"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    width: "100%",
    height: "45%",
  },
  topButtons: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80, // Espaço para os botões fixos
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#eee",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 20,
  },
  bottomPadding: {
    height: 20,
  },
  fixedActionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  rateButton: {
    flex: 1,
    backgroundColor: "#c3073f",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: "#2c2338",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  // Estilos para o modal de avaliação
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  ratingStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  ratingStarIcon: {
    marginHorizontal: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#f7a000",
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  starsRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
ratingNumber: {
  marginLeft: 8,
  fontSize: 16,
  fontWeight: 'bold',
  color: '#f7a000',
},
});

export default PointDetail;
