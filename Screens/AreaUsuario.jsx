// src/screens/AreaUsuario.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AreaUsuario = () => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError) throw authError;

        if (authData.user) {
          const { data: userInfo, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("user_id", authData.user.id)
            .single();

          if (userError) throw userError;
          setUser(userInfo);
        }
      } catch (error) {
        Alert.alert("Erro ao carregar usuário", error.message);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Erro ao sair", error.message);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color="#333"
        style={styles.icon}
      />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={require("../assets/BackgroundHeader.png")} // Imagem de fundo do header
        style={styles.header}
        resizeMode="cover"
      >
        <Text style={styles.headerTitle}>Área do Usuário</Text>
      </ImageBackground>

      <View style={styles.content}>
        {user ? (
          <View style={styles.card}>
            <InfoRow
              icon="account-circle-outline"
              label="Nome"
              value={user.nome}
            />
            <InfoRow icon="email-outline" label="Email" value={user.email} />
            <InfoRow
              icon="card-account-details-outline"
              label="CPF"
              value={user.cpf}
            />
            <InfoRow icon="gender-male-female" label="Sexo" value={user.sexo} />
            <InfoRow
              icon="calendar-month-outline"
              label="Membro desde"
              value={new Date(user.data_criacao).toLocaleDateString("pt-BR")}
            />
          </View>
        ) : (
          <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AreaUsuario;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  header: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  loadingText: {
    fontSize: 18,
    color: "#555",
    marginTop: 50,
  },
});
