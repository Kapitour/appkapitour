import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import DetalhesRota from "./DetalhesRotas";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../hooks/useAuth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "../components/Card";
import { colors } from "../theme/colors";
import { handleError } from "../utils/errors";
import { gradients } from "../theme/gradients";
import { useAccessibility } from "../src/accessibility/AccessibilityContext";

export default function Rotas() {
  const { state } = useAccessibility();
  const fontScale = state.fontScale || 1;
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState([]);
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const insets = useSafeAreaInsets();

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
          return { ...rota, imagem: null, categorias: [], pontoId: null };
        }
        
        const pontoIds = rotaPontos.map(p => p.ponto_id).filter(id => id);
        const primeiroPontoId = pontoIds[0];
        
        // Buscar imagem do primeiro ponto
        const { data: primeiroPonto, error: pontoError } = await supabase
          .from("pontos_turisticos")
          .select("url_img")
          .eq("id", primeiroPontoId)
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
          pontoId: primeiroPontoId, // Adicionar o ID do primeiro ponto
        };
      })
    );
    
    setRotas(rotasCompletas);
    setLoading(false);
  };

  useEffect(() => {
    fetchRotas();
    
    // Buscar informações do usuário e favoritos
    if (user?.id) {
      fetchUserInfo();
      fetchFavoritos();
    }
  }, [user]);

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

  // Buscar favoritos do usuário
  const fetchFavoritos = async () => {
    if (!user?.id) return;
    
    try {
      // Primeiro buscar o ID do usuário na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_id", user.id)
        .single();
        
      if (userError || !userData) {
        console.error("Erro ao buscar ID do usuário:", userError);
        return;
      }
      
      // Buscar favoritos do usuário
      const { data, error } = await supabase
        .from('favoritos')
        .select('ponto_id')
        .eq('usuario_id', userData.id);

      if (error) {
        console.error("Erro ao buscar favoritos:", error);
        return;
      }

      setFavoritos(data?.map(f => f.ponto_id) || []);
    } catch (err) {
      console.error("Erro inesperado ao buscar favoritos:", err);
    }
  };

  // Verificar se um ponto é favorito
  const isFavorito = (pontoId) => {
    return favoritos.includes(pontoId);
  };

  // Alternar favorito
  const toggleFavorito = async (pontoId, event) => {
    if (event) event.stopPropagation();
    
    if (!user?.id || !userInfo) {
      Alert.alert("Atenção", "Você precisa estar logado para favoritar pontos turísticos.");
      return;
    }

    try {
      if (isFavorito(pontoId)) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', userInfo.id)
          .eq('ponto_id', pontoId);
          
        if (error) throw error;
        
        setFavoritos(favoritos.filter(id => id !== pontoId));
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('favoritos')
          .insert({
            usuario_id: userInfo.id,
            ponto_id: pontoId,
            data_adicionado: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setFavoritos([...favoritos, pontoId]);
      }
    } catch (err) {
      handleError("Rotas.toggleFavorito", err, "Não foi possível atualizar o favorito.");
    }
  };

  const appBgGradient = state.darkMode
    ? { colors: ["#0f142c", "#0f142c"], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
    : gradients.appBg;

  if (loading) return (
    <LinearGradient {...appBgGradient} style={styles.containerPrincipal}>
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
    <LinearGradient {...appBgGradient} style={styles.containerPrincipal}>
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingTop: (insets.top || 55), paddingBottom: (insets.bottom || 90) + 10 }]}
        style={styles.scroll}
      >
        <Text style={[styles.title, { fontSize: Math.round(22 * fontScale) }]}>Escolher Rotas Turísticas</Text>
        <View style={styles.cardsContainer}>
          {rotas.map((rota) => (
            <TouchableOpacity
              key={rota.id}
              style={styles.cardContainer}
              onPress={() => setRotaSelecionada(rota)}
              activeOpacity={0.8}
            >
              <Card imageUrl={rota.imagem} title={rota.nome} style={{ height: 200 }}>
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={(e) => toggleFavorito(rota.id, e)}
                >
                  <Ionicons 
                    name={isFavorito(rota.id) ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isFavorito(rota.id) ? colors.primary : "white"} 
                  />
                </TouchableOpacity>
                <View style={styles.categoriesContainer}>
                  {rota.categorias && rota.categorias.slice(0, 2).map((categoria, idx) => (
                    <View key={idx} style={styles.categoryTag}>
                      <Text style={[styles.categoryText, { fontSize: Math.round(10 * fontScale) }]}>{categoria}</Text>
                    </View>
                  ))}
                  {rota.categorias && rota.categorias.length > 2 && (
                    <Text style={[styles.moreCategories, { fontSize: Math.round(10 * fontScale) }]}>+{rota.categorias.length - 2}</Text>
                  )}
                </View>
              </Card>
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
    paddingBottom: 100, // Adiciona espaçamento inferior para o BottomMenu
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
