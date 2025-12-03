// screens/Login.jsx  (arquivo completo pronto)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import logo from "../assets/Kapitour.png";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "../theme/gradients";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

// Supabase-only login

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn, signInWithGoogle } = useAuth();

  

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) Alert.alert("Erro", res.error || "Falha no login Google");
    setLoading(false);
  };

  


  // LOGIN EMAIL/SENHA
  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, senha);
      if (!result.success) {
        Alert.alert("Erro no login", result.error || "Credenciais inválidas.");
      }
    } catch (err) {
      console.error("Erro handleLogin:", err);
      Alert.alert("Erro", "Erro inesperado no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        {...gradients.appBg}
        style={styles.container}
      >
        <Image source={logo} style={{ marginBottom: -250 }} />

        <View style={styles.formBox}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#454140"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Senha"
              placeholderTextColor="#454140"
              secureTextEntry={!showPassword}
              value={senha}
              onChangeText={setSenha}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.togglePassword}
            >
              <FontAwesome
                name={showPassword ? "eye" : "eye-slash"}
                size={20}
                color="#454140"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Entrando..." : "Login"}
            </Text>
          </TouchableOpacity>
          <View style={styles.divider}>
            <Text style={styles.dividerText}>Outras opções:</Text>
          </View>

          <View style={styles.socialIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <FontAwesome name="google" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cadastro")}
            disabled={loading}
          >
            <Text style={styles.cadastroText}>Cadastrar-se</Text>
          </TouchableOpacity>

          
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

// estilos (mantive o seu)
const styles = StyleSheet.create({
  container: {
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
    marginTop: 200,
  },
  input: {
    backgroundColor: "#ffffff84",
    color: "#000",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 50,
  },
  togglePassword: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: "#c83349",
    padding: 15,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#777",
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
    fontSize: 20,
  },
  divider: {
    alignItems: "center",
    marginVertical: 20,
  },
  dividerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 20,
  },
  iconButton: {
    backgroundColor: "#c83349",
    width: 70,
    height: 40,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
