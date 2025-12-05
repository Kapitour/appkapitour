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
import Button from "../components/Button";
import { colors } from "../theme/colors";
import Card from "../components/Card";
import { gradients } from "../theme/gradients";
import ContainerImg from "../components/ContainerImg";
import MostCaroussel from "../components/MostCaroussel";
import { useNavigation } from "@react-navigation/native";
import DetalhesRota from "./DetalhesRotas";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.6;
const CARD_NARROW = Math.min(width * 0.9, 360);
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
      <Animated.View style={{ width: CARD_WIDTH, marginHorizontal: SPACING / 2, transform: [{ scale }] }}>
        <Card imageUrl={item.imageUri} title={item.title} description={item.description} style={{ height: 220 }}>
          {item.buttonText && (
            <Button variant="primary" icon="arrow-forward" onPress={item.onPress}>
              {item.buttonText}
            </Button>
          )}
        </Card>
      </Animated.View>
    );
  };

  if (rotaSelecionada) {
    return <DetalhesRota rota={rotaSelecionada} voltar={() => setRotaSelecionada(null)} />;
  }

  return (
    <LinearGradient {...gradients.appBg} style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#c83349" />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.topImageWrapper}>
            <ContainerImg style={styles.containerimg} />
            
          </View>

          <View style={styles.content}>
            <LinearGradient {...gradients.slogan} style={styles.slogan}>
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
              <Card
                title="Descubra pontos turísticos próximos"
                description="Abra o mapa e explore por categoria"
                style={{ alignSelf: 'center', width: CARD_NARROW, marginVertical: 10 }}
              >
                <Button variant="primary" icon="map" onPress={() => navigation.navigate("Mapa")}>Abrir Mapa</Button>
              </Card>
            </View>

            {/* ============== SEÇÃO DO CLIMA COM CAPIVARA ============== */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Previsão do Tempo</Text>
              </View>
              <Card
                imageUrl={"https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO%20-%20ENSOLARADO.png?raw=true"}
                title="Clima em Maricá"
                description="Clique para consultar a previsão do tempo e dicas para seu passeio!"
                style={{ alignSelf: 'center', width: CARD_NARROW }}
              >
                <Button variant="secondary" icon="sunny-outline" onPress={() => navigation.navigate('Clima')}>Ver clima</Button>
              </Card>
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
                initialNumToRender={patrocinadores.length}
                getItemLayout={(data, index) => ({
                  length: CARD_WIDTH + SPACING,
                  offset: (CARD_WIDTH + SPACING) * index,
                  index,
                })}
                onScrollToIndexFailed={(info) => {
                  const offset = (CARD_WIDTH + SPACING) * info.index;
                  flatListRef.current?.scrollToOffset({ offset, animated: true });
                }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
              />
              </View>
            </View>
          </View>

          <LinearGradient {...gradients.appBg} style={styles.footer}>
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
  
  discoverCard: {
    display: 'none',
  },
  discoverGradient: {
    display: 'none',
  },
  discoverIconContainer: {
    display: 'none',
  },
  discoverTextContainer: {
    display: 'none',
  },
  discoverTitle: {
    display: 'none',
  },
  discoverSubtitle: {
    display: 'none',
  },

  // estilos antigos removidos após migração para Card/Button

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