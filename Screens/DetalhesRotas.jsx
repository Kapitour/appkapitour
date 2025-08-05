import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import Checkbox from "expo-checkbox";

export default function DetalhesRota({ rota, voltar }) {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPontosDaRota = async () => {
      const { data: relacionamentos, error: errorRel } = await supabase
        .from("rota_ponto")
        .select("ponto_id, ordem")
        .eq("rota_id", rota.id)
        .order("ordem", { ascending: true });

      if (errorRel) {
        console.error("Erro rota_ponto:", errorRel);
        setLoading(false);
        return;
      }

      const pontoIds = relacionamentos.map((rel) => rel.ponto_id);

      const { data: pontosData, error: errorPontos } = await supabase
        .from("pontos_turisticos")
        .select("id, nome, descricao, rua_numero, latitude, longitude")
        .in("id", pontoIds);

      if (errorPontos) {
        console.error("Erro pontos_turisticos:", errorPontos);
      } else {
        setPontos(pontosData.map((p) => ({ ...p, completed: false })));
      }

      setLoading(false);
    };

    fetchPontosDaRota();
  }, [rota.id]);

  const toggleCheckbox = (index) => {
    const updated = [...pontos];
    updated[index].completed = !updated[index].completed;
    setPontos(updated);
  };

  const progresso = pontos.length
    ? (pontos.filter((p) => p.completed).length / pontos.length) * 100
    : 0;

  if (loading) return <ActivityIndicator size="large" color="#C3073F" />;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={voltar} style={styles.voltar}>
        <Text style={styles.voltarText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>{rota.nome}</Text>
      <Text style={styles.descricao}>{rota.descricao}</Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progresso}%` }]} />
      </View>

      {pontos.map((p, i) => (
        <View key={p.id} style={styles.pontoCard}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={p.completed}
              onValueChange={() => toggleCheckbox(i)}
              color={p.completed ? "#C3073F" : undefined}
            />
            <Text style={[styles.pontoNome, p.completed && styles.completed]}>
              {p.nome}
            </Text>
          </View>
          <Text style={styles.pontoDesc}>{p.descricao}</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`
              )
            }
            style={styles.gpsButton}
          >
            <Text style={styles.gpsText}>Iniciar Rota no GPS</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#1a1a1d" },
  voltar: {
    marginBottom: 30,
    marginTop: 30,
    color: "white",
    backgroundColor: "#C3073F",
    padding: 10,
  },
  voltarText: { color: "white", fontSize: 16 },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  descricao: { color: "#ccc", marginVertical: 10 },
  progressBar: {
    height: 10,
    backgroundColor: "#444",
    borderRadius: 5,
    marginVertical: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#C3073F",
    borderRadius: 5,
  },
  pontoCard: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pontoNome: { fontSize: 16, color: "#fff", marginLeft: 8 },
  completed: { textDecorationLine: "line-through", color: "#aaa" },
  pontoDesc: { color: "#ccc", marginBottom: 8 },
  gpsButton: {
    backgroundColor: "#C3073F",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  gpsText: { color: "#fff", fontWeight: "bold" },
});
