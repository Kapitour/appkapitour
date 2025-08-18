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
import { LinearGradient } from "expo-linear-gradient";
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

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f142c", "#c83349", "#f7a000"]}
        start={{ x: 1.5, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.containerPrincipal}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando detalhes da rota...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f142c", "#c83349", "#f7a000"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerPrincipal}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity onPress={voltar} style={styles.voltar}>
          <Text style={styles.voltarText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>{rota.nome}</Text>
        <Text style={styles.descricao}>{rota.descricao}</Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progresso: {Math.round(progresso)}%
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progresso}%` }]} />
          </View>
        </View>

        {pontos.map((p, i) => (
          <View key={p.id} style={styles.pontoCard}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={p.completed}
                onValueChange={() => toggleCheckbox(i)}
                color={p.completed ? "#f7a000" : undefined}
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
              <Text style={styles.gpsText}>📍 Iniciar Rota no GPS</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Estilos principais seguindo o padrão do Rotas.jsx
  containerPrincipal: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },

  // Botão voltar melhorado
  voltar: {
    backgroundColor: "#c3073f",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: "flex-start",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  voltarText: { 
    color: "#fff", 
    fontSize: 16,
    fontWeight: "bold",
  },

  // Títulos seguindo o padrão
  titulo: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  descricao: { 
    color: "#eee", 
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },

  // Progresso
  progressContainer: {
    width: "100%",
    marginBottom: 25,
  },
  progressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f7a000",
    borderRadius: 6,
  },

  // Cards dos pontos seguindo o padrão do Rotas.jsx
  pontoCard: {
    backgroundColor: "#c3073f",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  pontoNome: { 
    fontSize: 18, 
    color: "#fff", 
    marginLeft: 12,
    fontWeight: "bold",
    flex: 1,
  },
  completed: { 
    textDecorationLine: "line-through", 
    color: "#ccc",
    opacity: 0.7,
  },
  pontoDesc: { 
    color: "#eee", 
    marginBottom: 15,
    fontSize: 14,
    lineHeight: 20,
  },
  gpsButton: {
    backgroundColor: "#f7a000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  gpsText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16,
  },
});
