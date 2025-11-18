import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
  ImageBackground,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox";
import { salvarProgressoRota, carregarProgressoRota, limparProgressoRota } from "../utils/progressManager";

export default function DetalhesRota({ rota, voltar }) {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);
  const windowHeight = Dimensions.get("window").height;
  const TOP_PADDING = 55;
  const TAB_BAR_HEIGHT = 90;
  const GAP_FROM_TAB = 10;
  const HEADER_OFFSET = 150;
  const cardMinHeight = Math.max(300, windowHeight - TOP_PADDING - HEADER_OFFSET - TAB_BAR_HEIGHT - GAP_FROM_TAB);

  useEffect(() => {
    const fetchPontosDaRota = async () => {
      const { data: relacionamentos, error: errorRel } = await supabase
        .from("rota_ponto")
        .select("ponto_id, ordem")
        .eq("rota_id", rota.id)
        .order("ordem", { ascending: true });

      if (errorRel) {
        console.error("Erro rota_ponto:", errorRel);
        setLoading(false);
        return;
      }

      const pontoIds = relacionamentos.map((rel) => rel.ponto_id);

      const { data: pontosData, error: errorPontos } = await supabase
        .from("pontos_turisticos")
        .select("id, nome, descricao, rua_numero, latitude, longitude, url_img")
        .in("id", pontoIds);

      if (errorPontos) {
        console.error("Erro pontos_turisticos:", errorPontos);
      } else {
        // Carregar progresso salvo
        const progressoSalvo = await carregarProgressoRota(rota.id);
        // Ordena pontos pela ordem da relação
        const orderedIds = relacionamentos.sort((a,b)=>a.ordem-b.ordem).map(r=>r.ponto_id);
        const orderedPontos = orderedIds
          .map(id => pontosData.find(p => p.id === id))
          .filter(Boolean);

        const pontosComProgresso = orderedPontos.map((p) => {
          const pontoSalvo = progressoSalvo?.find(ps => ps.id === p.id);
          return {
            ...p,
            completed: pontoSalvo ? pontoSalvo.completed : false,
            rating: pontoSalvo && typeof pontoSalvo.rating === 'number' ? pontoSalvo.rating : null,
          };
        });
        
        setPontos(pontosComProgresso);
      }

      setLoading(false);
    };

    fetchPontosDaRota();
  }, [rota.id]);

  const toggleCheckbox = async (index) => {
    const updated = [...pontos];
    updated[index].completed = !updated[index].completed;
    setPontos(updated);
    
    // Salvar progresso automaticamente quando uma checkbox é alterada
    await salvarProgressoRota(rota.id, updated);
  };

  const resetarProgresso = async () => {
    const pontosResetados = pontos.map(p => ({ ...p, completed: false, rating: null }));
    setPontos(pontosResetados);
    await salvarProgressoRota(rota.id, pontosResetados);
  };

  const limparProgresso = async () => {
    await limparProgressoRota(rota.id);
    const pontosResetados = pontos.map(p => ({ ...p, completed: false, rating: null }));
    setPontos(pontosResetados);
  };

  const progresso = pontos.length
    ? (pontos.filter((p) => p.completed).length / pontos.length) * 100
    : 0;

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f142c", "#c83349", "#f7a000"]}
        start={{ x: 1.5, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.containerPrincipal}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando detalhes da rota...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#c83349", "#0f142c"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerPrincipal}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: TAB_BAR_HEIGHT + 10 }]}
      >
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Progresso: {Math.round(progresso)}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progresso}%` }]} />
          </View>
          {isStarted && pontos.length > 0 && (
            <View style={styles.stepBadge}>
              <Ionicons name="flag" size={14} color="#fff" />
              <Text style={styles.stepBadgeText}>Ponto {currentIndex + 1} de {pontos.length}</Text>
            </View>
          )}
        </View>

        {!isStarted ? (
          <>
            <TouchableOpacity onPress={voltar} style={styles.voltar}>
              <Text style={styles.voltarText}>← Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.titulo}>{rota.nome}</Text>
            <Text style={styles.descricao}>{rota.descricao}</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                const firstIncompleteIndex = pontos.findIndex(p => !p.completed);
                setCurrentIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
                setCurrentRating(0);
                setIsStarted(true);
              }}
            >
              <View style={styles.buttonInline}>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.startText}>Iniciar rota</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          pontos[currentIndex]?.url_img ? (
            <ImageBackground
              source={{ uri: pontos[currentIndex].url_img }}
              style={[styles.fullCardBg, { minHeight: cardMinHeight, marginBottom: 10 }]}
              imageStyle={styles.fullCardBgImage}
            >
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={styles.backOverlayButton}
                  onPress={() => {
                    const prev = currentIndex - 1;
                    setCurrentIndex(prev);
                    setCurrentRating(pontos[prev]?.rating || 0);
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <View style={styles.fullOverlayContent}>
                <Text style={styles.fullTitle}>{pontos[currentIndex]?.nome}</Text>
                <Text style={styles.fullDesc}>{pontos[currentIndex]?.descricao}</Text>
                <View style={styles.ratingRow}>
                  {[1,2,3,4,5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setCurrentRating(star)}>
                      <Ionicons
                        name={currentRating >= star ? "star" : "star-outline"}
                        size={26}
                        color="#f7a000"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.fullButtons}>
                  <TouchableOpacity
                    style={styles.gpsButton}
                    onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${pontos[currentIndex]?.latitude},${pontos[currentIndex]?.longitude}`)}
                  >
                    <View style={styles.buttonInline}>
                      <Ionicons name="navigate" size={18} color="#fff" />
                      <Text style={styles.gpsText}>Abrir no GPS</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={async () => {
                      if (currentRating === 0) {
                        Alert.alert("Avaliação necessária", "Avalie este ponto antes de prosseguir.");
                        return;
                      }
                      const updated = [...pontos];
                      updated[currentIndex] = { ...updated[currentIndex], completed: true, rating: currentRating };
                      setPontos(updated);
                      await salvarProgressoRota(rota.id, updated);
                      const nextIndex = currentIndex + 1;
                      if (nextIndex >= updated.length) {
                        setIsStarted(false);
                      } else {
                        setCurrentIndex(nextIndex);
                        setCurrentRating(0);
                      }
                    }}
                  >
                    <View style={styles.buttonInline}>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                      <Text style={styles.nextText}>Próximo</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.fullCard, { minHeight: cardMinHeight, marginBottom: 10 }]}>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={styles.backOverlayButton}
                  onPress={() => {
                    const prev = currentIndex - 1;
                    setCurrentIndex(prev);
                    setCurrentRating(pontos[prev]?.rating || 0);
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <Text style={styles.fullTitle}>{pontos[currentIndex]?.nome}</Text>
              <Text style={styles.fullDesc}>{pontos[currentIndex]?.descricao}</Text>
              <View style={styles.ratingRow}>
                {[1,2,3,4,5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setCurrentRating(star)}>
                    <Ionicons
                      name={currentRating >= star ? "star" : "star-outline"}
                      size={26}
                      color="#f7a000"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.fullButtons}>
                <TouchableOpacity
                  style={styles.gpsButton}
                  onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${pontos[currentIndex]?.latitude},${pontos[currentIndex]?.longitude}`)}
                >
                  <View style={styles.buttonInline}>
                    <Ionicons name="navigate" size={18} color="#fff" />
                    <Text style={styles.gpsText}>Abrir no GPS</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={async () => {
                    if (currentRating === 0) {
                      Alert.alert("Avaliação necessária", "Avalie este ponto antes de prosseguir.");
                      return;
                    }
                    const updated = [...pontos];
                    updated[currentIndex] = { ...updated[currentIndex], completed: true, rating: currentRating };
                    setPontos(updated);
                    await salvarProgressoRota(rota.id, updated);
                    const nextIndex = currentIndex + 1;
                    if (nextIndex >= updated.length) {
                      setIsStarted(false);
                    } else {
                      setCurrentIndex(nextIndex);
                      setCurrentRating(0);
                    }
                  }}
                >
                  <View style={styles.buttonInline}>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                    <Text style={styles.nextText}>Próximo</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        

      </ScrollView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Estilos principais seguindo o padrão do Rotas.jsx
  containerPrincipal: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 55,
    alignItems: "center",
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 55,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },

  // Botão voltar melhorado
  voltar: {
    backgroundColor: "#c3073f",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: "flex-start",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  voltarText: { 
    color: "#fff", 
    fontSize: 16,
    fontWeight: "bold",
  },

  // Títulos seguindo o padrão
  titulo: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  descricao: { 
    color: "#eee", 
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },

  // Progresso
  progressContainer: {
    width: "100%",
    marginBottom: 25,
  },
  progressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f7a000",
    borderRadius: 6,
  },
  stepBadge: {
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#2c2338",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#c3073f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginTop: 10,
  },
  resetText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  clearButton: {
    backgroundColor: '#c3073f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  clearText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Cards dos pontos seguindo o padrão do Rotas.jsx
  pontoCard: {
    backgroundColor: "#c3073f",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pontoImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#222",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    fontSize: 25
  },
  pontoNome: { 
    fontSize: 18, 
    color: "#fff", 
    marginLeft: 12,
    fontWeight: "bold",
    flex: 1,
  },
  completed: { 
    textDecorationLine: "line-through", 
    color: "#ccc",
    opacity: 0.7,
  },
  pontoDesc: { 
    color: "#eee", 
    marginBottom: 15,
    fontSize: 14,
    lineHeight: 20,
  },
  gpsButton: {
    backgroundColor: "#f7a000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  gpsText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16,
  },
  startButton: {
    backgroundColor: "#f7a000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  startText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  fullCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 16,
  },
  fullCardBg: {
    width: "100%",
    minHeight: 420,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  fullCardBgImage: {
    resizeMode: "cover",
  },
  fullOverlayContent: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  backOverlayButton: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 24,
    zIndex: 2,
  },
  fullTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  fullDesc: {
    color: "#ddd",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  fullButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  prevButton: {
    backgroundColor: "#2c2338",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  prevText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#c3073f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
