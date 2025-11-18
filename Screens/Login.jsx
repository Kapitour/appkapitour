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

import { useClerk, useOAuth, useUser } from "@clerk/clerk-expo";
import { supabase } from "../constants/supabase"; // ajuste se for ../lib/supabase
import { useAuth } from "../hooks/useAuth";

// função que verifica/cria no supabase — NÃO usa campos que podem não existir (ex: tipo)
const signInWithGoogleOnSupabase = async ({ email, name, authId = null }) => {
  try {
    // busca se já existe (maybeSingle para não throw)
    const { data: usuarioExiste, error: findError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      // não tratar como fatal se for erro temporário, mas logamos
      console.warn("Erro ao buscar usuário no supabase:", findError);
    }

    if (usuarioExiste) {
      return { success: true, created: false, user: usuarioExiste };
    }

    // inserir apenas campos básicos
    const insertPayload = {
      email,
      nome: name ?? "Usuário",
      criado_em: new Date().toISOString(),
    };

    // se você quiser armazenar auth_id (caso use supabase auth), passe aqui
    if (authId) insertPayload.auth_id = authId;

    const { data: created, error: insertError } = await supabase
      .from("usuarios")
      .insert([insertPayload])
      .select()
      .maybeSingle();

    if (insertError) {
      // log detalhado para você debugar (mostra o json do erro)
      console.error("Erro insert supabase:", insertError);
      return { success: false, error: insertError };
    }

    return { success: true, created: true, user: created };
  } catch (err) {
    console.error("Exception signInWithGoogleOnSupabase:", err);
    return { success: false, error: err };
  }
};

// util que espera até userHook estar carregado (timeout em ms)
const waitForUserLoaded = async (userHook, timeout = 5000) => {
  const start = Date.now();
  // se já carregado, retorna
  if (userHook.isLoaded) return true;
  // polling
  return new Promise((resolve) => {
    const iv = setInterval(() => {
      if (userHook.isLoaded) {
        clearInterval(iv);
        resolve(true);
        return;
      }
      if (Date.now() - start > timeout) {
        clearInterval(iv);
        resolve(false);
      }
    }, 200);
  });
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const clerk = useClerk();
  const userHook = useUser(); // hook do Clerk para pegar dados do usuário após setSession
  const googleAuth = useOAuth({ strategy: "oauth_google" });

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // HANDLE GOOGLE
  const handleGoogleLogin = async () => {
  try {
    setLoading(true);

    // limpar sessão antes
    try {
      await clerk.signOut();
    } catch (_) {}

    let result;
    try {
      result = await googleAuth.startOAuthFlow();
    } catch (err) {
      console.error("🔥 Erro bruto do Clerk OAuth:", err);
      Alert.alert("Erro Google", "Falha ao iniciar login com Google.\n" + err.message);
      return;
    }

    console.log("OAuth result:", result);

    // falha no OAuth ANTES de criar sessão
    if (!result?.createdSessionId) {
      console.error("OAuth sem sessionId:", result);
      Alert.alert("Erro Google", "Falha ao criar sessão via Google.");
      return;
    }

    await clerk.setSession(result.createdSessionId);

    // esperar user carregar (9s)
    const ok = await waitForUserLoaded(userHook, 9000);

    if (!ok || !userHook.user) {
      console.log("⛔ userHook depois de 9s:", JSON.stringify(userHook, null, 2));
      Alert.alert(
        "Erro Google",
        "Google autenticou, mas não foi possível obter seus dados.\nTente novamente."
      );
      return;
    }

    // pegar email
    const userObj = userHook.user;
    const email =
      userObj?.primaryEmailAddress?.emailAddress ||
      userObj?.emailAddresses?.[0]?.emailAddress ||
      null;

    if (!email) {
      console.error("❌ Clerk não retornou email:", userObj);
      Alert.alert("Erro", "Google logou, mas não retornou seu e-mail.");
      return;
    }

    // salvar no supabase
    const supa = await signInWithGoogleOnSupabase({
      email,
      name: userObj.fullName || userObj.firstName,
    });

    if (!supa.success) {
      console.error("❌ ERRO Supabase:", supa.error);

      Alert.alert(
        "Erro Supabase",
        JSON.stringify(supa.error, null, 2) // <-- mostra o erro real
      );
      return;
    }

    // sucesso → Home
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });

  } catch (err) {
    console.error("❌ ERRO FINAL:", err);
    Alert.alert("Erro", "Falha ao entrar com Google.");
  } finally {
    setLoading(false);
  }
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
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
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

          <TouchableOpacity
            onPress={() => navigation.navigate("Cadastro")}
            disabled={loading}
          >
            <Text style={styles.cadastroText}>Cadastrar-se</Text>
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

            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="facebook" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="instagram" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
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
