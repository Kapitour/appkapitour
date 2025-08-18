import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import logo from "../assets/Kapitour.png";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      Alert.alert("Erro no login", error.message);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "AreaUsuario" }],
      });
    }
  };

  return (
    
      <LinearGradient
                colors={["#c83349", "#f7a000"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
              >
      <Image source={logo} style={{ marginBottom: -250 }}></Image>

      <View style={styles.formBox}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#454140"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          textAlign="center"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#454140"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          textAlign="center"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
          <Text style={styles.cadastroText}>Cadastrar-se</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Login por:</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="google" size={20} color="#c83349" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="facebook" size={20} color="#c83349" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="instagram" size={20} color="#c83349" />
          </TouchableOpacity>
        </View>
      </View>
      </LinearGradient>

  );
};

export default LoginScreen;

const styles = StyleSheet.create({

  container:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  formBox: {
    padding: 10,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#dfdfdf",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
    marginTop: 200,
  },
  input: {
    backgroundColor: "#ffffff84",
    color: "#000000cc",
    padding: 20,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#c83349",
    padding: 15,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 20,
  },
  cadastroText: {
    color: "#fff",
    marginTop: 15,
    textAlign: "center",
    fontSize:20
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerText: {
    color: "#fff",
    marginHorizontal: 10,
    fontWeight: "bold",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#fff",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 20,
  },
  iconButton: {
    backgroundColor: "#ffffffa2",
    width: 70,
    height: 40,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
});
