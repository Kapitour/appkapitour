import React, { useState } from "react";
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
import { useAuth } from "../hooks/useAuth";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔑 Login com email/senha
  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, senha);

      if (result.success) {
        console.log("Login realizado com sucesso!");
      } else {
        Alert.alert("Erro no login", result.error);
      }
    } catch (error) {
      Alert.alert("Erro no login", "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#c83349", "#090909ff"]}
        start={{ x: 1.5, y: 0 }}
        end={{ x: 1, y: 1 }}
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
            textAlign="left"
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
              textAlign="left"
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

          <TouchableOpacity
            onPress={() => navigation.navigate("Cadastro")}
            disabled={loading}
          >
            <Text style={styles.cadastroText}>Cadastrar-se</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Outras opções:</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialIcons}>
            {/* Google - removida a lógica */}
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => alert("Login Google removido")}
              disabled={loading}
            >
              <FontAwesome name="google" size={20} color="#c83349" />
            </TouchableOpacity>

            {/* Facebook (placeholder) */}
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="facebook" size={20} color="#c83349" />
            </TouchableOpacity>

            {/* Instagram (placeholder) */}
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="instagram" size={20} color="#c83349" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

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
    shadowColor: "#dfdfdf",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
    marginTop: 200,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#ffffff84",
    color: "#000000cc",
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
    backgroundColor: "#cccccc",
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
    backgroundColor: "#d02626a2",
    width: 70,
    height: 40,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
});
