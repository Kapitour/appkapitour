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
const CARD_WIDTH = width * 0.6;  // Largura do card reduzida
const SPACING = 15;  // Aumento do espaçamento entre os cards

export default function Home() {
  const navigation = useNavigation();
  const [categoriaId, setCategoriaId] = useState(null);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Categorias e mapa saem da Home; card leva ao Mapa

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
          {/* Imagem de topo */}
          <View style={styles.topImageWrapper}>
            <ContainerImg style={styles.containerimg} />
            {/* Botão menu hamburguer transparente no topo direito */}
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Slogan */}
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

            {/* Top 10 Guias mais bem avaliados */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top 10 Guias mais bem avaliados</Text>
            </View>
            <MostCaroussel onRotaPress={setRotaSelecionada} />

            {/* Descobrir no mapa */}
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

            {/* Patrocinadores */}
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

          {/* Footer */}
          <LinearGradient colors={["#c83349", "#0f142c"]} style={styles.footer}>
            <Text style={styles.footerText}>© 2023 Kapitour - Todos os direitos reservados</Text>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // SafeArea: envolve toda a aplicação, garantindo que o conteúdo não ultrapasse áreas
  // que podem ser cobertas por barras de status ou outros componentes nativos.
  safeArea: {
    flex: 1, // Faz com que o componente ocupe toda a altura da tela.
  },
  
  // Container principal do conteúdo.
  container: {
    flex: 1, // Faz com que o conteúdo ocupe toda a altura disponível.
    paddingTop: 20, // Adiciona espaçamento no topo para não colidir com a barra de status.
    paddingHorizontal: 15, // Adiciona margens laterais para evitar que o conteúdo encoste nas bordas
    paddingBottom: 100, // Adiciona espaçamento inferior para o BottomMenu
    marginBottom: 50
  },

  // Wrapper (caixa) que envolve a imagem do topo da tela.
  topImageWrapper: {
    height: 50, // Altura da imagem de topo.
    justifyContent: "flex-end", // Posiciona o conteúdo no final da área (parte inferior).
  },

  // Estilo da imagem do topo.
  containerimg: {
    width: "100%", // A imagem ocupa toda a largura da tela.
    height: "100%", // A altura da imagem é igual a altura definida do wrapper.
  },

  // Botão de menu, posicionado no canto superior direito.
  menuButton: {
    position: "absolute", // Permite posicionar o botão em qualquer lugar da tela.
    top: 10, // Distância de 10 pixels do topo.
    right: 10, // Distância de 10 pixels da direita.
    zIndex: 1, // Garante que o botão fique acima de outros componentes.
  },

  // Estilo do slogan que aparece logo após a imagem do topo.
  slogan: {
    padding: 15, // Espaçamento interno da área do slogan.
    margin: 10, // Margem ao redor do slogan, afastando ele das bordas.
    borderRadius: 8, // Bordas arredondadas.
    alignItems: "center", // Centraliza os itens dentro do slogan.
    justifyContent: "center", // Alinha os itens no centro verticalmente.
    textAlign: "center", // Alinha o texto do slogan no centro.
    flexDirection: "row", // Organiza o ícone e o texto em linha.
  },

  // Ícone do compasso no slogan.
  sloganIcon: {
    marginRight: 0, // Retira qualquer margem à direita do ícone.
  },

  // Texto dentro do slogan.
  sloganText: {
    color: "#fff", // Cor branca para o texto.
    fontSize: 14, // Tamanho da fonte.
    fontWeight: "600", // Peso da fonte (semi-negrito).
    textAlign: "center", // Alinha o texto no centro.
  },

  // Cabeçalho das seções, que inclui título e um botão para expandir/ocultar.
  sectionHeader: {
    flexDirection: "row", // Organiza título e botão horizontalmente.
    justifyContent: "space-between", // Distribui o espaço entre o título e o botão.
    alignItems: "center", // Alinha os itens verticalmente no centro.
    marginBottom: 10, // Espaçamento inferior para separar das próximas seções.
  },

  // Título das seções, como "Categorias", "Rotas mais realizadas".
  sectionTitle: {
    fontSize: 20, // Tamanho da fonte.
    fontWeight: "bold", // Deixa o texto em negrito.
    color: "#fff", // Cor do texto.
  },

  // Estilo do link "Ver todas" ou "Expandir" nas seções.
  seeAll: {
    color: "#fff", // Cor branca para o link.
    fontSize: 14, // Tamanho da fonte.
  },

  // Estilo para a seção de Categorias e outros conteúdos.
  section: {
    marginBottom: 30, // Espaço entre as seções.
  },

  // Container para exibir os filtros de categorias.
  categoriasContainer: {
    marginTop: 10, // Espaço superior para dar distância do título da categoria.
  },

  // Estilo dos botões de filtro de categorias.
  filtro: {
    paddingVertical: 10, // Espaçamento vertical (dentro do botão).
    paddingHorizontal: 15, // Espaçamento horizontal (dentro do botão).
    backgroundColor: "#fff", // Cor de fundo branca.
    marginRight: 10, // Espaçamento à direita entre os filtros.
    borderRadius: 20, // Bordas arredondadas.
  },

  // Estilo quando um filtro de categoria está selecionado.
  filtroSelecionado: {
    backgroundColor: "#c83349", // Cor de fundo vermelha para o filtro selecionado.
  },

  // Texto dentro do botão de filtro de categoria.
  textoCategoria: {
    color: "#333", // Cor do texto (cinza escuro).
  },

  // Wrapper (caixa) do mapa, que só aparece quando categorias são exibidas.
  mapaWrapper: {
    marginTop: 20, // Distância superior entre o mapa e os outros componentes.
    backgroundColor: "#fff", // Cor de fundo branca.
    padding: 10, // Espaçamento interno da área do mapa.
    borderRadius: 10, // Bordas arredondadas.
  },

  // Botão para fechar o mapa.
  closeMapButton: {
    position: "absolute", // Posiciona o botão de fechamento sobre o mapa.
    top: 10, // Distância do topo.
    right: 10, // Distância da direita.
    backgroundColor: "#c83349", // Cor de fundo vermelha.
    borderRadius: 20, // Bordas arredondadas.
    padding: 5, // Padding pequeno para um clique confortável.
  },

  // Estilo do carrossel de patrocinadores.
  carouselContainer: {
    height: 240, // Altura do carrossel.
    marginTop: 10, // Distância superior do carrossel.
  },

  // Estilo do card de patrocinador.
  card: {
    backgroundColor: "#fff", // Cor de fundo branca para o card.
    borderRadius: 20, // Bordas arredondadas.
    padding: 15, // Espaçamento interno do card.
    width: CARD_WIDTH, // Largura do card baseada em uma constante.
    marginHorizontal: SPACING / 2, // Espaçamento horizontal entre os cards.
    alignItems: "center", // Centraliza o conteúdo dentro do card.
    justifyContent: "center", // Alinha o conteúdo centralizado.
    shadowColor: "#000", // Cor da sombra.
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra.
    shadowOpacity: 0.25, // Opacidade da sombra.
    shadowRadius: 3.84, // Raio de desfocagem da sombra.
    elevation: 5, // Sombra no Android.
  },

  // Cabeçalho do card, geralmente onde fica o ícone ou logo.
  cardHeader: {
    marginBottom: 15, // Espaçamento inferior entre a imagem e o conteúdo.
    alignItems: "center", // Alinha o conteúdo do cabeçalho no centro.
  },

  // Container para a imagem dentro do card.
  cardImageContainer: {
    width: 80, // Largura do container da imagem.
    height: 80, // Altura do container da imagem.
    borderRadius: 40, // Faz com que a imagem fique circular.
    overflow: "hidden", // Garante que a imagem não ultrapasse os limites do container.
    backgroundColor: "transparent", // Fundo transparente.
    justifyContent: "center", // Centraliza a imagem dentro do container.
    alignItems: "center", // Alinha a imagem dentro do container.
  },

  // Estilo para imagens circulares (logo ou ícones).
  imageCircle: {
    width: 80, // Largura da imagem circular.
    height: 80, // Altura da imagem circular.
    borderRadius: 40, // Bordas arredondadas para formar o círculo.
  },

  // Estilo para imagens da incubadora (não circulares).
  imageIncubadora: {
    width: "100%", // A imagem ocupa toda a largura do container.
    height: 80, // Altura fixa para a imagem da incubadora.
    resizeMode: "contain", // A imagem é ajustada para caber sem distorcer.
  },

  // Conteúdo dentro do card, onde fica o título, descrição, etc.
  cardContent: {
    alignItems: "center", // Centraliza o conteúdo dentro do card.
  },

  // Título do patrocinador no card.
  cardTitle: {
    color: "#c83349", // Cor vermelha para o título.
    fontSize: 16, // Tamanho da fonte.
    fontWeight: "bold", // Deixa o título em negrito.
    marginBottom: 8, // Espaçamento inferior entre o título e o texto.
    textAlign: "center", // Alinha o título no centro.
  },

  // Texto descritivo dentro do card.
  cardText: {
    color: "#333", // Cor do texto (cinza escuro).
    textAlign: "center", // Alinha o texto no centro.
    marginBottom: 12, // Espaçamento inferior entre a descrição e o botão.
    fontSize: 12, // Tamanho da fonte.
  },

  // Estilo do botão dentro do card (para abrir link, por exemplo).
  button: {
    backgroundColor: "#c83349", // Cor de fundo vermelha.
    flexDirection: "row", // Organiza texto e ícone horizontalmente.
    alignItems: "center", // Alinha o ícone e o texto no centro.
    paddingHorizontal: 12, // Espaçamento horizontal dentro do botão.
    paddingVertical: 8, // Espaçamento vertical dentro do botão.
    borderRadius: 20, // Bordas arredondadas.
  },

  // Texto dentro do botão.
  buttonText: {
    color: "#fff", // Cor do texto (branca).
    marginRight: 6, // Espaçamento à direita do texto (antes do ícone).
    fontWeight: "600", // Peso do texto (semi-negrito).
  },

  // Estilos para o card de descoberta no mapa
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
  
  // Rodapé da página.
  footer: {
    padding: 15, // Espaçamento interno do rodapé.
    alignItems: "center", // Centraliza o conteúdo no rodapé.
    justifyContent: "center", // Alinha o conteúdo no centro verticalmente.
    backgroundColor: "#0f142c", // Cor de fundo escura para o rodapé.
  },

  // Texto do rodapé.
  footerText: {
    color: "#fff", // Cor do texto (branca).
    fontSize: 12, // Tamanho da fonte (menor que o conteúdo principal).
  },
});
