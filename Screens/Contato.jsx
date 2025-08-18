import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import fundo from "../assets/contatoFundo.png";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Contato() {
  const [showForm, setShowForm] = useState(false);

  const handleLinkPress = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      alert("Não foi possível abrir o link.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={["#c83349", "#f7a000"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.containerColor}
      >
        <Image source={fundo} style={styles.fundoimg}></Image>
        <Text style={styles.title}>Fale com a gente</Text>
        <View style={styles.btns}>
          {/* Ícone telefone */}
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleLinkPress("tel:+5521983581550")}
          >
            <View style={styles.iconCircle}>
              <Icon name="phone" size={20} color="#fff" />
            </View>
            <Text style={styles.contactText}>(21) 98358-1550</Text>
          </TouchableOpacity>

          {/* Ícone Gmail */}
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() =>
              handleLinkPress("mailto:plataformadigitalkapitour@gmail.com")
            }
          >
            <View style={styles.iconCircle}>
              <Icon name="envelope" size={20} color="#fff" />
            </View>
            <Text style={styles.contactText}>Nosso email</Text>
          </TouchableOpacity>

          {/* Ícone Instagram */}
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() =>
              handleLinkPress("https://www.instagram.com/kapi.tour")
            }
          >
            <View style={styles.iconCircle}>
              <Icon name="instagram" size={20} color="#fff" />
            </View>
            <Text style={styles.contactText}>@kapi.tour</Text>
          </TouchableOpacity>

          {/* Botão de mensagem */}
          {!showForm && (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => setShowForm(true)}
            >
              <View style={styles.iconCircle}>
                <Icon name="comment" size={20} color="#fff" />
              </View>
              <Text style={styles.contactText}>Enviar uma mensagem</Text>
            </TouchableOpacity>
          )}
        </View>
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} placeholder="Seu nome" />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu email"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Mensagem</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Digite sua mensagem"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent", // fundo escuro, igual login
  },
  containerColor: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100,
    alignItems: "center",
    
  },
  fundoimg: {
    position: "absolute",
    width: 500,
    height: 900,
    marginTop:10
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
    textAlign: "center",
  },
  btns: {
    marginTop: "90%",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2e2e2",
    padding: 20,
    paddingHorizontal:50,
    borderRadius: 10,
    marginBottom: 15,
  },
  iconCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#c93434",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactText: {
    color: "#000000",
    fontSize: 16,
    flexShrink: 1,
  },
  form: {
    marginTop: 30,
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#4e4e50",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: "#4e4e50",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    height: 100,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#c93434",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
