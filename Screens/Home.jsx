import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Animated, 
  FlatList, 
  Dimensions, 
  Linking, 
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ContainerImg from "../components/ContainerImg";
import MostCaroussel from "../components/MostCaroussel";
import { useNavigation } from "@react-navigation/native";
import DetalhesRota from "./DetalhesRotas";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.6;
const SPACING = 15;

export default function Home() {
  const navigation = useNavigation();
  const [categoriaId, setCategoriaId] = useState(null);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const patrocinadores = [
    {
      id: "1",
      title: "AGM Maricá",
      description: "Parceria com a AGM Associação dos Guias de Turismo de Maricá.",
      imageUri: "https://github.com/Kapitour/Imgs-Padr-o/blob/main/home/agm.png?raw=true",
      buttonText: "Guias de Turismo",
      onPress: () => Linking.openURL(
        "https://wa.me/5521971292030?text=Olá%20vim%20pela%20Kapitour%20e%20gostaria%20de%20contratar%20um%20guia%20de%20turismo!"
      ),
      style: "circle",
    },
    {
      id: "2",
      title: "Vassouras Tec",
      description: "Incubadora tecnológica da Univassouras.",
      imageUri: "https://github.com/Kapitour/Imgs-Padr-o/blob/main/VassourasT%C3%A9c.png?raw=true",
      style: "incubadora",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % patrocinadores.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderPatrocinador = ({ item, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardImageContainer}>
            <Image 
              source={{ uri: item.imageUri }} 
              style={item.style === "circle" ? styles.imageCircle : styles.imageIncubadora} 
              resizeMode="contain" 
            />
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardText}>{item.description}</Text>
          {item.buttonText && (
            <TouchableOpacity onPress={item.onPress} style={styles.button}>
              <Text style={styles.buttonText}>{item.buttonText}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  if (rotaSelecionada) {
    return <DetalhesRota rota={rotaSelecionada} voltar={() => setRotaSelecionada(null)} />;
  }

  return (
    <LinearGradient 
      colors={["#c83349", "#0f142c"]} 
      start={{ x: 1.5, y: 0 }} 
      end={{ x: 1, y: 1 }} 
      style={styles.safeArea}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#c83349" />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.topImageWrapper}>
            <ContainerImg style={styles.containerimg} />
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <LinearGradient 
              colors={["#c833498d", "#e65a6d8a", "#f7a10069"]} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.slogan}
            >
              <Ionicons name="compass" size={24} color="#fff" style={styles.sloganIcon} />
              <Text style={styles.sloganText}>
                Somos a Kapitour, e viemos lhe revelar o que Maricá pode te proporcionar
              </Text>
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top 10 Guias mais bem avaliados</Text>
            </View>
            <MostCaroussel onRotaPress={setRotaSelecionada} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Descubra no Mapa</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.discoverCard} 
                onPress={() => navigation.navigate("Mapa")}
              >
                <LinearGradient 
                  colors={["#c83349", "#f7a000"]} 
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.discoverGradient}
                >
                  <View style={styles.discoverIconContainer}>
                    <Ionicons name="map" size={32} color="#fff" />
                  </View>
                  <View style={styles.discoverTextContainer}>
                    <Text style={styles.discoverTitle}>Descubra pontos turísticos próximos</Text>
                    <Text style={styles.discoverSubtitle}>Abra o mapa e explore por categoria</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* ============== SEÇÃO DO CLIMA COM CAPIVARA ============== */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Previsão do Tempo</Text>
              </View>
              
              {/* Card da Capivara com Balão de Fala */}
              <View style={styles.capybaraCard}>
                {/* Balão de fala clicável */}
                <TouchableOpacity 
                  style={styles.speechBubble}
                  onPress={() => navigation.navigate('Clima')}
                >
                  <View style={styles.bubbleHeader}>
                    <Ionicons name="sunny-outline" size={14} color="#fff" />
                    <Text style={styles.bubbleTitle}>Clima em Maricá</Text>
                  </View>
                  <Text style={styles.bubbleText}>Clique aqui para consultar a previsão do tempo e dicas para seu passeio!</Text>
                </TouchableOpacity>
                
                {/* Imagem da capivara no lado direito */}
                <Image
                  source={{ uri: "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO%20-%20ENSOLARADO.png?raw=true" }}
                  style={styles.capybaraImage}
                />
              </View>
            </View>
            {/* ============================================================= */}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nossos Parceiros</Text>
              </View>
              <View style={styles.carouselContainer}>
                <Animated.FlatList 
                  ref={flatListRef}
                  data={patrocinadores} 
                  keyExtractor={(item) => item.id} 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  pagingEnabled 
                  snapToInterval={CARD_WIDTH + SPACING} 
                  decelerationRate="fast" 
                  contentContainerStyle={{ paddingHorizontal: SPACING / 2 }} 
                  renderItem={renderPatrocinador}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                  )}
                />
              </View>
            </View>
          </View>

          <LinearGradient colors={["#c83349", "#0f142c"]} style={styles.footer}>
            <Text style={styles.footerText}>© 2023 Kapitour - Todos os direitos reservados</Text>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 100,
    marginBottom: 50
  },
  topImageWrapper: {
    height: 50,
    justifyContent: "flex-end",
  },
  containerimg: {
    width: "100%",
    height: "100%",
  },
  menuButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  slogan: {
    padding: 15,
    margin: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    flexDirection: "row",
  },
  sloganIcon: {
    marginRight: 0,
  },
  sloganText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  seeAll: {
    color: "#fff",
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  categoriasContainer: {
    marginTop: 10,
  },
  filtro: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginRight: 10,
    borderRadius: 20,
  },
  filtroSelecionado: {
    backgroundColor: "#c83349",
  },
  textoCategoria: {
    color: "#333",
  },
  mapaWrapper: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  closeMapButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#c83349",
    borderRadius: 20,
    padding: 5,
  },
  carouselContainer: {
    height: 240,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 15,
    alignItems: "center",
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imageIncubadora: {
    width: "100%",
    height: 80,
    resizeMode: "contain",
  },
  cardContent: {
    alignItems: "center",
  },
  cardTitle: {
    color: "#c83349",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  cardText: {
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 12,
  },
  button: {
    backgroundColor: "#c83349",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    marginRight: 6,
    fontWeight: "600",
  },
  discoverCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#c83349",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  discoverGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  discoverIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  discoverTextContainer: {
    flex: 1,
  },
  discoverTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  discoverSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },

  // ============== ESTILOS DO BOTÃO ADICIONADOS AQUI ==============
  weatherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Um fundo semi-transparente para combinar
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  weatherButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // =============================================================

  // ============== ESTILOS DA CAPIVARA ADICIONADOS AQUI ==============
  capybaraCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  capybaraImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  speechBubble: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bubbleTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bubbleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  // =================================================================

  footer: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f142c",
  },
  footerText: {
    color: "#fff",
    fontSize: 12,
  },
});