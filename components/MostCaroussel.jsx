import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

const getMostUsedRoutes = async () => {
  const { data: rotas, error } = await supabase
    .from("rotas")
    .select("id, nome, rota_ponto(ponto_id, ordem)")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao buscar rotas:", error.message);
    return [];
  }

  const rotasComImagem = await Promise.all(
    rotas.map(async (rota) => {
      // Ordenar os pontos da rota pela ordem
      const pontosOrdenados = rota.rota_ponto.sort((a, b) => a.ordem - b.ordem);
      const primeiroPontoId = pontosOrdenados[0]?.ponto_id;

      if (!primeiroPontoId) return null;

      // Buscar ponto turístico para pegar imagem
      const { data: ponto, error: pontoError } = await supabase
        .from("pontos_turisticos")
        .select("url_img")
        .eq("id", primeiroPontoId)
        .single();

      if (pontoError || !ponto?.url_img) return null;

      return {
        nome: rota.nome,
        imagem: ponto.url_img,
      };
    })
  );

  // Filtra rotas que tenham imagens
  return rotasComImagem.filter((r) => r !== null);
};

const MostCaroussel = () => {
  const [rotas, setRotas] = useState([]);

  useEffect(() => {
    const fetchRotas = async () => {
      const data = await getMostUsedRoutes();
      setRotas(data);
    };

    fetchRotas();
  }, []);

return (
  <View>
    <Text style={styles.texto}>Rotas mais realizadas:</Text>
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {rotas.map((rota, index) => (
        <LinearGradient
          colors={["#c83349", "#f7a000"]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.box}
        >
          {/* Lembre-se, a key deve ir aqui no LinearGradient */}
          <View key={index} style={styles.boxContent}>
            {/* Imagem */}
            <Image source={{ uri: rota.imagem }} style={styles.image} />

            <Text style={styles.nome}>{rota.nome}</Text>
          </View>
        </LinearGradient>
      ))}
      {/* Missing closing parenthesis and brace for the map function */}
    </ScrollView>
  </View>
);
};

export default MostCaroussel;

// Estilos

const styles = StyleSheet.create({
  box: {
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 25,
    height: 200,
    width: 150,
    margin: 10,
    overflow: "hidden",
  },
  boxContent: {},

  image: {
    width: "100%",
    height: "85%",
    resizeMode: "cover",
  },
  nome: {
    textAlign: "center",
    fontWeight: "bold",
    paddingTop: 5,
    color: "#fff",
  },
  texto: {
    color: "white",
    fontSize: 14,
    marginBottom: 10,
  },
});
