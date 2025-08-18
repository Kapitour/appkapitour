import React, { Component } from "react";
import { View, Image, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

class ContainerImg extends Component {
  render() {
    return (
      <View style={styles.container}>
        {/* Imagem de fundo */}
        <Image
          style={styles.img1}
          source={require("../assets/BackgroundHeader.png")}
          resizeMode="cover"
        />
                {/* Gradiente para transparência na parte inferior */}
        <LinearGradient
          colors={["transparent", "#0f142c"]} // do topo transparente para a cor de fundo
          style={styles.gradient}
        />

        {/* Conteúdo sobreposto */}
        <View style={styles.content}>
          <Image
            style={styles.img2}
            source={require("../assets/Kapitour.png")}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }
}

export default ContainerImg;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250, // altura do topo (imagem + conteúdo)
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  img1: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  gradient: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 100, // altura do fade
  zIndex: 1,   // acima da imagem de fundo
},
  content: {
    zIndex: 1,
    alignItems: "center",
    paddingTop: 10, // espaço superior geral
    paddingHorizontal: 10,
  },
  img2: {
    width: width * 0.8,
    aspectRatio: 1,
    marginTop: -20, // sobe a logo
  },
});
