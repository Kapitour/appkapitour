import React, { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Clerk
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

// Auth Context (Supabase)
import { useAuth } from "./hooks/useAuth";

// Telas
import Home from "./Screens/Home";
import Login from "./Screens/Login";
import Rotas from "./Screens/Rotas";
import Loja from "./Screens/Loja";
import Contato from "./Screens/Contato";
import Mapa from "./Screens/Mapa";
import Cadastro from "./Screens/Cadastro";
import AreaUsuario from "./Screens/AreaUsuario";
import LeitorQR from "./Screens/LeitorQR";
import WeatherScreen from "./Screens/WeatherScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// SUA PUBLIC KEY CLERK
const CLERK_KEY = "pk_test_bGl2aW5nLWJlYWdsZS01MS5jbGVyay5hY2NvdW50cy5kZXYk";

// Cache Clerk
const tokenCache = {
  getToken: (key) => SecureStore.getItemAsync(key),
  saveToken: (key, value) => SecureStore.setItemAsync(key, value),
};

// Telas para não logados
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
    </Stack.Navigator>
  );
}

// Tabs principais
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#c83349",
        tabBarInactiveTintColor: "#bbbbbb",
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Início"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" color={color} size={28} />
          ),
        }}
      />

      {/* SE LOGADO → AreaUsuario / SE DESLOGADO → Login */}
      <Tab.Screen
        name="Conta"
        component={AccountEntry}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Rotas"
        component={Rotas}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="navigate-outline" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Loja"
        component={Loja}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart-outline" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Mapa"
        component={Mapa}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Lida com a aba "Conta"
function AccountEntry() {
  return (
    <>
      <SignedIn>
        <AreaUsuario />
      </SignedIn>

      <SignedOut>
        <AuthStack />
      </SignedOut>
    </>
  );
}

// Stack Principal
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="LeitorQR" component={LeitorQR} />
      <Stack.Screen name="Contato" component={Contato} />
      <Stack.Screen name="Clima" component={WeatherScreen} />
    </Stack.Navigator>
  );
}

// 🔥 TELA DE NAVEGAÇÃO CORRIGIDA (SUPABASE + CLERK)
function NavigationContent() {
  const { user, loading } = useAuth(); // pega usuário do SUPABASE

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c83349" />
      </View>
    );
  }

  // 🔥 se não está logado no Supabase → Login
  if (!user) {
    return <AuthStack />;
  }

  // 🔥 se está logado → Tabs/Home
  return <MainStack />;
}

export default function App() {
  useEffect(() => {
    const hideNavigationBar = async () => {
      try {
        await SystemUI.setBackgroundColorAsync("black");
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        console.warn("Erro ao esconder NavigationBar:", error);
      }
    };
    hideNavigationBar();
  }, []);

  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      tokenCache={tokenCache}
      redirectUrl="kapitest://callback"
    >
      <NavigationContainer>
        <StatusBar hidden />
        <NavigationContent />
      </NavigationContainer>
    </ClerkProvider>
  );
}

// ESTILOS CORRIGIDOS
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderTopWidth: 0,
  },
});
