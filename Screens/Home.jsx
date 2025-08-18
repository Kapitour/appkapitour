import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import ContainerImg from "../components/ContainerImg";
import MostCaroussel from "../components/MostCaroussel";
import Map from "../components/Map";
import Categories from "../components/Categories";
import Partiners from "../components/Partiners";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const [categoriaId, setCategoriaId] = useState(null);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <LinearGradient
        colors={["#0f142c","#468ead", "#192042"]} // The typo was here
        start={{ x: 3, y: 0 }}
        end={{ x: 5, y: 1 }}
        style={styles.containercolor}
      >
        <ContainerImg style={styles.containerimg} />
        <View style={styles.pad}>
          <LinearGradient
            colors={["#c83349", "#f7a000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.slogan}
          >
            <Text style={styles.sloganText}>
              Somos a Kapitour, e viemos lhe revelar o que Maricá pode te
              proporcionar
            </Text>
          </LinearGradient>
          <MostCaroussel />
          <Categories onSelectCategoria={setCategoriaId} />
          <Map categoriaId={categoriaId} />
        </View>

        <Partiners />
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  containercolor: {
    flex: 1,
    paddingBottom: 100,
  },
  containerimg: {
    height: 250,
  },
  pad: {
    marginHorizontal: 15,
  },
  slogan: {
    padding: 25,
    margin: 15,
    borderBottomLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 5,
    alignItems: "center",
  },
  sloganText: {
    color: "#f0f0f0",
    textAlign: "center",
    fontSize: 16,
  },
});