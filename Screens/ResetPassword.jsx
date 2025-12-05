import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "../theme/gradients";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";

const ResetPassword = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError("");
    if (!password || password.length < 6) {
      setError("Senha muito curta");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigation.navigate("Login"), 1200);
  };

  return (
    <LinearGradient {...gradients.appBg} style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Definir nova senha</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>Senha atualizada</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Nova senha"
          placeholderTextColor="#454140"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#454140"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          editable={!loading}
        />
        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Enviando..." : "Salvar"}</Text>
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

export default ResetPassword;
