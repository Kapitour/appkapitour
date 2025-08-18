import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

const Partiners = () => {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.stagger(200, [
        Animated.timing(card1Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(card2Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const openWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/5521971292030?text=Olá%20vim%20pela%20Kapitour%20e%20gostaria%20de%20contratar%20um%20guia%20de%20turismo!"
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleAnim,
            transform: [
              {
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        Parceiros
      </Animated.Text>

      <View style={styles.rowContainer}>
        {/* Card 1 */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: card1Anim,
              transform: [
                {
                  translateY: card1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={{
              uri: "https://github.com/Kapitour/Imgs-Padr-o/blob/main/home/agm.png?raw=true",
            }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.cardText}>
            Parceria com a AGM Associação dos Guias de Turismo de Maricá...
          </Text>
          <TouchableOpacity onPress={openWhatsApp} style={styles.button}>
            <Text style={styles.buttonText}>Guias de Turismo</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Card 2 */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: card2Anim,
              transform: [
                {
                  translateY: card2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={{
              uri: "https://github.com/Kapitour/Imgs-Padr-o/blob/main/VassourasT%C3%A9c.png?raw=true",
            }}
            style={[styles.image, { width: "90%" }]}
            resizeMode="contain"
          />
          <Text style={styles.cardText}>
            Vassouras Tec, incubadora tecnológica da Univassouras...
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    borderBottomColor:"#fff",
    borderBottomWidth:2,
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    padding: 3,
    textAlign: "center",
    marginBottom: 20,
  },
  rowContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  card: {
    backgroundColor: "#333333b5",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    minHeight: 350,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  cardText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "rgba(201, 52, 52, 0.884)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default Partiners;
