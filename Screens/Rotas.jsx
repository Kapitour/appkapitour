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
    <ScrollView
      style={{ backgroundColor: "#1a1a1d" }} // <- aqui
      contentContainerStyle={styles.container}
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
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#1a1a1d" },
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
  },
  nome: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  desc: { color: "#eee", marginTop: 5 },
});
