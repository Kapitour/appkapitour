import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../hooks/useAuth";

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
        pontoId: pontoIds[0], // Adicionando o ID do primeiro ponto para favoritos
      };
    })
  );

  // Filtra rotas que tenham imagens
  return rotasComImagemECategorias.filter((r) => r !== null);
};

const MostCaroussel = ({ onRotaPress }) => {
  const [rotas, setRotas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchRotas = async () => {
      const data = await getMostUsedRoutes();
      setRotas(data);
    };

    fetchRotas();
    
    // Buscar informações do usuário
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
  const toggleFavorito = async (pontoId) => {
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
      console.error("Erro ao atualizar favorito:", err);
      Alert.alert("Erro", "Não foi possível atualizar o favorito.");
    }
  };

  const handleRotaPress = (rota) => {
    if (onRotaPress) {
      onRotaPress(rota);
    }
  };

  // Função para lidar com o clique no botão de favorito
  const handleFavoritoClick = (rotaId, event) => {
    if (event) {
      event.stopPropagation();
    }
    toggleFavorito(rotaId);
  };

  return (
    <View>
      
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
                onPress={(e) => handleFavoritoClick(rota.pontoId, e)}
              >
                <Ionicons 
                  name={isFavorito(rota.pontoId) ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorito(rota.pontoId) ? "#c3073f" : "white"} 
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
