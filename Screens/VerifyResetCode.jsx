import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "../theme/gradients";
import { confirmResetWithCode } from "../services/reset";
import { useNavigation, useRoute } from "@react-navigation/native";

const VerifyResetCode = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email || "";
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    setError("");
    if (!email || !code || code.length !== 6) { setError("Código inválido"); return; }
    if (!password || password.length < 6) { setError("Senha muito curta"); return; }
    if (password !== confirm) { setError("As senhas não coincidem"); return; }
    setLoading(true);
    const res = await confirmResetWithCode(email, code, password);
    setLoading(false);
    if (!res.success) { setError(res.error || "Falha ao confirmar"); return; }
    setSuccess(true);
    setTimeout(() => navigation.navigate("Login"), 1200);
  };

  return (
    <LinearGradient {...gradients.appBg} style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Verificar código</Text>
        <Text style={styles.subtitle}>{email}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>Senha atualizada</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Código de 6 dígitos"
          placeholderTextColor="#454140"
          keyboardType="numeric"
          value={code}
          onChangeText={setCode}
          maxLength={6}
          editable={!loading}
        />
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
        <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Validando..." : "Confirmar"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}> 
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  box: { width: "100%", maxWidth: 400 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  subtitle: { color: "#fff", textAlign: "center", marginBottom: 8 },
  input: { backgroundColor: "#ffffff84", color: "#000", padding: 16, borderRadius: 10, marginBottom: 12 },
  button: { backgroundColor: "#c83349", padding: 14, borderRadius: 40, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  link: { color: "#fff", marginTop: 12, textAlign: "center" },
  error: { color: "#ffdddd", textAlign: "center", marginBottom: 8 },
  success: { color: "#bdf7bd", textAlign: "center", marginBottom: 8 },
});

export default VerifyResetCode;
