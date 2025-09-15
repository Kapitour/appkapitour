import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./../lib/supabase";

export default function Cadastro() {
  const navigation = useNavigation();
  const [registered, setRegistered] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [sexo, setSexo] = useState("");
  const [password, setPassword] = useState("");
  const [nascimento, setNascimento] = useState("");

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(formScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true)
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const formatCpf = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 11);
    const formatted = cleaned
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return formatted;
  };

  const handleSexoChange = (value) => {
    setSexo(value === sexo ? "" : value);
  };

  const handleRegister = async () => {
    if (!name || !email || !cpf || !sexo || !password || !nascimento) {
      alert("Preencha todos os campos.");
      return;
    }
    try {
      // Primeiro, verifica se o email já existe
      const { data: existingUsers, error: checkError } = await supabase
        .from("usuarios")
        .select("email")
        .eq("email", email);

      if (checkError) {
        alert("Erro ao verificar email: " + checkError.message);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        alert("Este email já está cadastrado.");
        return;
      }

      // Cria o usuário no Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name,
            cpf,
            sexo,
            nascimento,
          },
        },
      });

      if (error) {
        alert("Erro: " + error.message);
        return;
      }

      const user = data.user;

      if (user) {
        // Insere os dados na tabela usuarios
        const { error: insertError } = await supabase.from("usuarios").insert([
          {
            user_id: user.id,
            nome: name,
            email: email,
            cpf: cpf,
            sexo: sexo,
            data_nascimento: nascimento,
            data_criacao: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          alert("Erro ao inserir dados do usuário: " + insertError.message);
          return;
        }

        // Envia e-mail de confirmação (use o método correto para sua versão do Supabase)
        const { error: emailError } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });

        if (emailError) {
          console.log("Erro ao enviar email:", emailError);
        }

        // Exibe mensagem de confirmação
        Alert.alert(
          "Cadastro realizado com sucesso!",
          "Um e-mail de confirmação foi enviado. Por favor, verifique sua caixa de entrada.",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }
            }
          ]
        );

        setRegistered(true);
      }

    } catch (err) {
      alert("Erro inesperado: " + err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {!registered ? (
            <Animated.View
              style={[
                styles.formBox,
                {
                  opacity: formOpacity,
                  transform: [{ scale: formScale }],
                },
              ]}
            >
              <Text style={styles.label}>Nome:</Text>
              <TextInput
                placeholder="Digite seu nome"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Email:</Text>
              <TextInput
                placeholder="Digite seu email"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>CPF:</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  placeholder="Digite seu CPF"
                  style={[styles.input, { flex: 1 }]}
                  value={cpf}
                  onChangeText={(text) => setCpf(formatCpf(text))}
                  keyboardType="numeric"
                  maxLength={14}
                />
                {keyboardOpen && (
                  <TouchableOpacity
                    onPress={Keyboard.dismiss}
                    style={{ marginLeft: 10 }}
                  >
                    <Text style={{ color: "white", fontSize: 16 }}>Fechar</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.label}>Sexo:</Text>
              <View style={styles.checkboxGroup}>
                <Pressable
                  style={[
                    styles.checkbox,
                    sexo === "Masculino" && styles.checkboxSelected,
                  ]}
                  onPress={() => handleSexoChange("Masculino")}
                >
                  <Text style={styles.checkboxText}>Masculino</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.checkbox,
                    sexo === "Feminino" && styles.checkboxSelected,
                  ]}
                  onPress={() => handleSexoChange("Feminino")}
                >
                  <Text style={styles.checkboxText}>Feminino</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Senha:</Text>
              <TextInput
                placeholder="Digite sua senha"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Data de Nascimento:</Text>
              <TextInput
                placeholder="DD/MM/AAAA"
                style={styles.input}
                value={nascimento}
                onChangeText={setNascimento}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Cadastrar</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.formBox,
                {
                  opacity: formOpacity,
                  transform: [{ scale: formScale }],
                },
              ]}
            >
              <Text style={styles.success}>
                Cadastro realizado com sucesso!
              </Text>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.buttonText}>Fazer Login</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#1a1a1d",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  formBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  label: {
    color: "white",
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    color: "black",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#c83349",
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  success: {
    color: "#0f0",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  checkboxGroup: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  checkbox: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#444",
  },
  checkboxSelected: {
    backgroundColor: "#c83349",
  },
  checkboxText: {
    color: "white",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
});