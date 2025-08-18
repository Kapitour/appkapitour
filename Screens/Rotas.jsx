import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import DetalhesRota from "./DetalhesRotas";
import { LinearGradient } from "expo-linear-gradient";

export default function Rotas() {
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRotas = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("rotas").select("*");
      if (error) console.error("Erro ao buscar rotas:", error);
      else setRotas(data);
      setLoading(false);
    };
    fetchRotas();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#C3073F" />;

  if (rotaSelecionada)
    return (
      <DetalhesRota
        rota={rotaSelecionada}
        voltar={() => setRotaSelecionada(null)}
      />
    );

  return (
    // O GRADIENTE AGORA É O CONTAINER PRINCIPAL
    <LinearGradient
      colors={[ "#c83349", "#f7a000"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerPrincipal} // NOVO ESTILO
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer} // NOVO ESTILO
        style={styles.scroll}
      >
        <Text style={styles.title}>Escolher Rotas Turísticas</Text>
        {rotas.map((rota) => (
          <TouchableOpacity
            key={rota.id}
            style={styles.card}
            onPress={() => setRotaSelecionada(rota)}
          >
            <Text style={styles.nome}>{rota.nome}</Text>
            <Text style={styles.desc}>{rota.descricao}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ESTILO PARA O CONTAINER PRINCIPAL COM O GRADIENTE
  containerPrincipal: {
    flex: 1,
  },
  // A SCROLLVIEW AGORA TEM UM FUNDO TRANSPARENTE
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // ESTILO PARA O CONTEÚDO DENTRO DA SCROLLVIEW
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
  card: {
    backgroundColor: "#c3073f",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: "100%",
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  desc: {
    color: "#eee",
    marginTop: 5,
  },
});