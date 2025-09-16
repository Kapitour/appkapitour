import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import fundo from "../assets/contatoFundo.png";

const Contato = () => {
  const [showForm, setShowForm] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -20,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 20,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLinkPress = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      alert("Não foi possível abrir o link.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Imagem de fundo animada */}
      <Animated.Image
        source={fundo}
        style={[
          styles.fundoimg,
          {
            transform: [{ translateX }],
          },
        ]}
        resizeMode="cover"
        blurRadius={1}
      />

      {/* Conteúdo com fundo semi-transparente */}
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <Text style={styles.title}>Entre em Contato</Text>

            <View style={styles.btns}>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => handleLinkPress("tel:+5521983581550")}
              >
                <View style={styles.iconCircle}>
                  <FontAwesome name="phone" size={20} color="#fff" />
                </View>
                <Text style={styles.contactText}>(21) 98358-1550</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={() =>
                  handleLinkPress("mailto:plataformadigitalkapitour@gmail.com")
                }
              >
                <View style={styles.iconCircle}>
                  <FontAwesome name="envelope" size={20} color="#fff" />
                </View>
                <Text style={styles.contactText}>Nosso email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={() =>
                  handleLinkPress("https://www.instagram.com/kapi.tour")
                }
              >
                <View style={styles.iconCircle}>
                  <FontAwesome name="instagram" size={20} color="#fff" />
                </View>
                <Text style={styles.contactText}>@kapi.tour</Text>
              </TouchableOpacity>

              {!showForm && (
                <TouchableOpacity
                  style={[styles.contactItem, styles.messageButton]}
                  onPress={() => setShowForm(true)}
                >
                  <View style={styles.iconCircle}>
                    <FontAwesome name="comment" size={20} color="#fff" />
                  </View>
                  <Text style={styles.contactText}>Enviar uma mensagem</Text>
                </TouchableOpacity>
              )}
            </View>

            {showForm && (
              <View style={styles.form}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#ccc"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu email"
                  placeholderTextColor="#ccc"
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Mensagem</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Digite sua mensagem"
                  placeholderTextColor="#ccc"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>Enviar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Contato;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  fundoimg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    opacity: 0.25,
  },
  overlay: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
    alignItems: "center",
    backgroundColor: "rgba(59, 8, 21, 0.83)", // Cor mais escura e opaca, vermelho com azul escuro
    borderRadius: 0,
    
    
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 60,
    marginBottom: 30,
    textAlign: "center",
    letterSpacing: 1,
  },
  btns: {
    width: "100%",
    marginTop: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconCircle: {
    width: 42,
    height: 42,
    backgroundColor: "#c93434",
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  messageButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "#c93434",
    borderWidth: 1.5,
  },
  form: {
    width: "100%",
    marginTop: 30,
  },
  label: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
    fontSize: 14,
    height: 40,
  },
  textArea: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    height: 90,
    fontSize: 14,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#c93434",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
