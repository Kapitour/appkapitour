import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { supabase } from "../lib/supabase";
import DetalhesRota from "./DetalhesRotas";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

export default function Rotas() {
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const fetchRotas = async () => {
      setLoading(true);
      
      // Buscar todas as rotas
      const { data: rotasData, error } = await supabase.from("rotas").select("*");
      
      if (error) {
        console.error("Erro ao buscar rotas:", error);
        setLoading(false);
        return;
      }
      
      // Para cada rota, buscar imagem e categorias
      const rotasCompletas = await Promise.all(
        rotasData.map(async (rota) => {
          // Buscar pontos da rota
          const { data: rotaPontos, error: pontosError } = await supabase
            .from("rota_ponto")
            .select("ponto_id, ordem")
            .eq("rota_id", rota.id)
            .order("ordem", { ascending: true });
            
          if (pontosError || !rotaPontos || rotaPontos.length === 0) {
            return { ...rota, imagem: null, categorias: [] };
          }
          
          const pontoIds = rotaPontos.map(p => p.ponto_id).filter(id => id);
          
          // Buscar imagem do primeiro ponto
          const { data: primeiroPonto, error: pontoError } = await supabase
            .from("pontos_turisticos")
            .select("url_img")
            .eq("id", pontoIds[0])
            .single();
            
          // Buscar categorias dos pontos
          const { data: pontoCategorias, error: categoriasError } = await supabase
            .from("ponto_categoria")
            .select("categoria_id")
            .in("ponto_id", pontoIds);
            
          let categoriasNomes = [];
          if (!categoriasError && pontoCategorias && pontoCategorias.length > 0) {
            // Extrair IDs de categorias únicas
            const categoriaIds = [...new Set(pontoCategorias.map(pc => pc.categoria_id))];
            
            // Buscar nomes das categorias
            const { data: categorias } = await supabase
              .from("categorias")
              .select("nome")
              .in("id", categoriaIds);
              
            if (categorias) {
              categoriasNomes = categorias.map(c => c.nome);
            }
          }
          
          return {
            ...rota,
            imagem: primeiroPonto?.url_img || null,
            categorias: categoriasNomes,
          };
        })
      );
      
      setRotas(rotasCompletas);
      setLoading(false);
    };
    
    fetchRotas();
  }, []);

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

  if (loading) return (
    <LinearGradient
      colors={["#c83349", "#0f142c"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerPrincipal}
    >
      <ActivityIndicator size="large" color="#C3073F" style={styles.loader} />
    </LinearGradient>
  );

  if (rotaSelecionada)
    return (
      <DetalhesRota
        rota={rotaSelecionada}
        voltar={() => setRotaSelecionada(null)}
      />
    );

  return (
    <LinearGradient
      colors={["#c83349", "#0f142c"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerPrincipal}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        style={styles.scroll}
      >
        <Text style={styles.title}>Escolher Rotas Turísticas</Text>
        <View style={styles.cardsContainer}>
          {rotas.map((rota) => (
            <TouchableOpacity
              key={rota.id}
              style={styles.cardContainer}
              onPress={() => setRotaSelecionada(rota)}
              activeOpacity={0.8}
            >
              <View style={styles.card}>
                {rota.imagem ? (
                  <Image source={{ uri: rota.imagem }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.noImage]}>
                    <Text style={styles.noImageText}>Sem imagem</Text>
                  </View>
                )}
                
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
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  cardsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "100%",
    marginBottom: 16,
  },
  card: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImage: {
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#fff",
    fontSize: 14,
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
    fontSize: 16,
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
