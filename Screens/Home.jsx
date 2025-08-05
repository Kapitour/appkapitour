import React, { useState } from "react"; // ← IMPORTANTE
import { View, ScrollView, StyleSheet, Text } from "react-native";
import ContainerImg from "../components/ContainerImg";
import MostCaroussel from "../components/MostCaroussel";
import Map from "../components/Map";
import Categories from "../components/Categories";
import Partiners from "../components/Partiners";

export default function Home() {
  const [categoriaId, setCategoriaId] = useState(null); // ← CRIA O ESTADO

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <ContainerImg style={styles.containerimg} />
      <View style={styles.pad}>
        <Text style={styles.slogan}>
          Somos a Kapitour, e viemos lhe revelar o que Maricá pode te
          proporcionar
        </Text>
        <MostCaroussel />
        <Categories onSelectCategoria={setCategoriaId} /> {/* ← Passa função */}
        <Map categoriaId={categoriaId} /> {/* ← Passa categoriaId */}
      </View>

      <Partiners />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1d",
    paddingBottom: 100,
  },
  containerimg: {
    height: 250,
  },
  pad: {
    marginHorizontal: 15,
  },
  slogan: {
    color: "#f0f0f0",
    textAlign: "center",
    fontSize: 16,
    padding: 25,
    backgroundColor: "#c83349",
    margin: 15,
    borderBottomLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
