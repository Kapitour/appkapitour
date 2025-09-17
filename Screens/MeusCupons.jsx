import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { supabase } from "../supabaseClient"; // ajuste o caminho do seu cliente

const MeusCupons = ({ userId }) => {
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarCupons();
  }, []);

  const buscarCupons = async () => {
    try {
      const { data, error } = await supabase
        .from("cupons_resgatados")
        .select(`
          id,
          data_resgate,
          cupom:cupom_id (
            id,
            codigo,
            descricao,
            data_validade
          )
        `)
        .eq("usuario_id", userId);

      if (error) {
        console.error("Erro ao buscar cupons:", error);
        return;
      }

      setCupons(data || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderCupom = ({ item }) => (
    <View style={styles.cupomCard}>
      <Text style={styles.cupomCodigo}>{item.cupom?.codigo}</Text>
      <Text style={styles.cupomDescricao}>{item.cupom?.descricao}</Text>
      <Text style={styles.cupomValidade}>
        Validade: {item.cupom?.data_validade}
      </Text>
      <Text style={styles.cupomResgatado}>
        Resgatado em: {new Date(item.data_resgate).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (cupons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Você ainda não resgatou nenhum cupom.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cupons}
      renderItem={renderCupom}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 20,
  },
  cupomCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  cupomCodigo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53935", // vermelho do app
    marginBottom: 6,
  },
  cupomDescricao: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  cupomValidade: {
    fontSize: 12,
    color: "#666",
  },
  cupomResgatado: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default MeusCupons;