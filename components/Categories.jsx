import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function Categories({ onSelectCategoria }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("categorias").select("*");
      if (!error) setCategorias(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Text>Carregando categorias...</Text>;

  return (
    <View>
      <Text style={styles.titulo}>Categorias</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.componente}
      >
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.filtro}
            onPress={() => onSelectCategoria(cat.id)}
          >
            <Text style={styles.textoCategoria}>{cat.nome}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  componente: { marginBottom: 10 },
  filtro: {
    backgroundColor: "#c83349",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  textoCategoria: { fontSize: 18, color: "white" },
});
