import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "../theme/gradients";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";

const ForgotPasswordEmail = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setError("");
    if (!email) { setError("Informe o email"); return; }
    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const redirect = Platform.OS === 'web' ? origin : 'kapitest://';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirect });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setSent(true);
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  };

  return (
    <LinearGradient {...gradients.appBg} style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Recuperar senha</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {sent ? <Text style={styles.success}>Código enviado</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Seu email"
          placeholderTextColor="#454140"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
        <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar código"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}> 
          <Text style={styles.link}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  box: { width: "100%", maxWidth: 400 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { backgroundColor: "#ffffff84", color: "#000", padding: 16, borderRadius: 10, marginBottom: 12 },
  button: { backgroundColor: "#c83349", padding: 14, borderRadius: 40, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  link: { color: "#fff", marginTop: 12, textAlign: "center" },
  error: { color: "#ffdddd", textAlign: "center", marginBottom: 8 },
  success: { color: "#bdf7bd", textAlign: "center", marginBottom: 8 },
});

export default ForgotPasswordEmail;
