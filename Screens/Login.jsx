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
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import logo from "../assets/Kapitour.png";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "../theme/gradients";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
 
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
WebBrowser.maybeCompleteAuthSession();

import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

// Supabase-only login

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    responseType: "id_token",
    scopes: ["openid", "email", "profile"],
  });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      WebBrowser.maybeCompleteAuthSession();
      if (Platform.OS === 'web' && request) {
        const webOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : undefined;
        const res = await promptAsync({ useProxy: false, redirectUri: webOrigin });
        if (res?.type === 'success') {
          const idToken = res.params?.id_token;
          const { error: authErr } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
          if (!authErr) {
            return;
          }
          Alert.alert("Erro", authErr.message || "Falha na autenticação.");
          return;
        }
      }
      const proxyUrl = 'https://auth.expo.io/@barralbruno/kapitest';
      const webOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : undefined;
      const directUrl = makeRedirectUri({ path: 'auth/callback', preferLocalhost: false });
      console.log('------------------------------------------------');
      console.log('⚠️ COPIE O LINK ABAIXO E COLE NO SUPABASE ⚠️');
      console.log(directUrl);
      console.log('------------------------------------------------');
      console.log('1. Pedindo URL ao Supabase...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: Platform.OS === 'web' && webOrigin ? webOrigin : directUrl,
          skipBrowserRedirect: true,
        },
      });
      console.log("[OAuth] signInWithOAuth response", { error: error?.message, url: data?.url });
      if (data?.url) {
        console.log('2. URL gerada com sucesso. Abrindo navegador...');
      }
      if (error || !data?.url) {
        Alert.alert("Erro", error?.message || "Falha ao iniciar OAuth.");
        return;
      }
      let result = await WebBrowser.openAuthSessionAsync(data.url, directUrl);
      console.log('3. Resultado do navegador:', result);
      if (result.type !== "success") {
        Alert.alert("Erro", "Login cancelado ou não concluído.");
        try { await WebBrowser.dismissBrowser(); } catch (_) {}
        return;
      }
      const params = QueryParams.getQueryParams(result.url || '');
      if (params.access_token && params.refresh_token) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token: String(params.access_token),
          refresh_token: String(params.refresh_token),
        });
        if (setErr) {
          Alert.alert("Erro", setErr.message);
          return;
        }
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('4. Sucesso! Login concluído.', { hasUser: !!session?.user, userId: session?.user?.id });
      if (!session?.user) {
        await new Promise((res) => setTimeout(res, 1500));
        const {
          data: { session: session2 },
        } = await supabase.auth.getSession();
        console.log("[OAuth] session after retry", { hasUser: !!session2?.user, userId: session2?.user?.id });
        if (session2?.user) return;
        Alert.alert("Erro", "Não foi possível concluir o login com o Google.");
      }
    } catch (err) {
      console.error("[OAuth] exception", err);
      Alert.alert("Erro", err.message);
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

  const handleSendReset = async () => {
    if (!resetEmail) return;
    const webOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
    await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), { redirectTo: webOrigin });
    setShowResetModal(false);
  };

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const href = typeof window !== 'undefined' && window.location ? window.location.href : '';
      if (href && (href.includes('type=recovery') || href.includes('access_token'))) {
        try { navigation.navigate('ResetPassword'); } catch (_) {}
      }
    }
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}>
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
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} disabled={loading}>
            <Text style={styles.cadastroText}>Esqueci minha senha</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate("Cadastro")} disabled={loading}>
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
  resetOverlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  resetBox: {
    width: '90%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 12, padding: 16
  },
});

export default LoginScreen;
