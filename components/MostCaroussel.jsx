import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import { Ionicons } from '@expo/vector-icons';

const getMostUsedRoutes = async () => {
  const { data: rotas, error } = await supabase
    .from("rotas")
    .select("id, nome, rota_ponto(ponto_id, ordem)")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao buscar rotas:", error.message);
    return [];
  }

  const rotasComImagemECategorias = await Promise.all(
    rotas.map(async (rota) => {
      // Ordenar os pontos da rota pela ordem
      const pontosOrdenados = rota.rota_ponto.sort((a, b) => a.ordem - b.ordem);
      const pontoIds = pontosOrdenados.map(p => p.ponto_id).filter(id => id);
      
      if (pontoIds.length === 0) return null;

      // Buscar ponto turístico para pegar imagem
      const { data: ponto, error: pontoError } = await supabase
        .from("pontos_turisticos")
        .select("url_img")
        .eq("id", pontoIds[0])
        .single();

      if (pontoError || !ponto?.url_img) return null;

      // Buscar categorias dos pontos da rota através da tabela de relacionamento
      const { data: pontoCategorias, error: categoriasError } = await supabase
        .from("ponto_categoria")
        .select("categoria_id")
        .in("ponto_id", pontoIds);

      if (categoriasError) {
        console.error("Erro ao buscar categorias:", categoriasError.message);
        return null;
      }

      // Extrair IDs de categorias únicas
      const categoriaIds = [...new Set(pontoCategorias.map(pc => pc.categoria_id))];
      
      // Buscar nomes das categorias
      let categoriasNomes = [];
      if (categoriaIds.length > 0) {
        const { data: categorias, error: categoriasNomesError } = await supabase
          .from("categorias")
          .select("nome")
          .in("id", categoriaIds);
          
        if (!categoriasNomesError && categorias) {
          categoriasNomes = categorias.map(c => c.nome);
        }
      }

      return {
        id: rota.id,
        nome: rota.nome,
        imagem: ponto.url_img,
        categorias: categoriasNomes,
      };
    })
  );

  // Filtra rotas que tenham imagens
  return rotasComImagemECategorias.filter((r) => r !== null);
};

const MostCaroussel = ({ onRotaPress }) => {
  const [rotas, setRotas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const fetchRotas = async () => {
      const data = await getMostUsedRoutes();
      setRotas(data);
    };

    fetchRotas();
  }, []);

  const handleRotaPress = (rota) => {
    if (onRotaPress) {
      onRotaPress(rota);
    }
  };

  const toggleFavorito = (rotaId, event) => {
    event.stopPropagation();
    setFavoritos(prev => {
      if (prev.includes(rotaId)) {
        return prev.filter(id => id !== rotaId);
      } else {
        return [...prev, rotaId];
      }
    });
  };

  return (
    <View>
      <Text style={styles.texto}>Rotas mais realizadas:</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {rotas.map((rota, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleRotaPress(rota)}
            activeOpacity={0.8}
            style={styles.cardContainer}
          >
            <View style={styles.box}>
              <Image source={{ uri: rota.imagem }} style={styles.image} />
              
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={(e) => toggleFavorito(rota.id, e)}
              >
                <Ionicons 
                  name={favoritos.includes(rota.id) ? "heart" : "heart-outline"} 
                  size={24} 
                  color={favoritos.includes(rota.id) ? "#c3073f" : "white"} 
                />
              </TouchableOpacity>
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              >
                <View style={styles.infoContainer}>
                  <Text style={styles.nome}>{rota.nome}</Text>
                  <View style={styles.categoriesContainer}>
                    {rota.categorias && rota.categorias.slice(0, 2).map((categoria, idx) => (
                      <View key={idx} style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{categoria}</Text>
                      </View>
                    ))}
                    {rota.categorias && rota.categorias.length > 2 && (
                      <Text style={styles.moreCategories}>+{rota.categorias.length - 2}</Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MostCaroussel;

// Estilos

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 8,
    marginVertical: 10,
  },
  box: {
    width: 180,
    height: 240,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: "flex-end",
  },
  infoContainer: {
    width: "100%",
  },
  nome: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  categoryTag: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    color: "#333",
    fontSize: 10,
    fontWeight: "500",
  },
  moreCategories: {
    color: "white",
    fontSize: 10,
    marginLeft: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  texto: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
});
