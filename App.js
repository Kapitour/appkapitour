import React, { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./hooks/useAuth";

// Telas
import Home from "./Screens/Home";
import Login from "./Screens/Login";
import Rotas from "./Screens/Rotas";
import Loja from "./Screens/Loja";
import Contato from "./Screens/Contato";
import Cadastro from "./Screens/Cadastro";
import AreaUsuario from "./Screens/AreaUsuario";
import LeitorQR from "./Screens/LeitorQR";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de autenticação (apenas para usuários não logados)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
    </Stack.Navigator>
  );
}

// Stack principal com todas as telas
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="LeitorQR" component={LeitorQR} />
    </Stack.Navigator>
  );
}

// Tabs principais
function MainTabs() {
  const { user } = useAuth();

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
      <Tab.Screen
        name="Conta"
        component={user ? AreaUsuario : AuthStack}
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
        name="Contato"
        component={Contato}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="call-outline" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Componente de navegação principal
function NavigationContent() {
  const { user, loading } = useAuth();

  // Tela de loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c83349" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Usuário logado - mostrar stack principal com tabs
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        // Usuário não logado - mostrar stack de autenticação
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    const hideNavigationBar = async () => {
      try {
        await SystemUI.setBackgroundColorAsync("black");
        //await NavigationBar.setBehaviorAsync("inset-swipe");
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        console.warn("Erro ao esconder NavigationBar:", error);
      }
    };
    hideNavigationBar();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar hidden />
      <NavigationContent />
    </NavigationContainer>
  );
}

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
    overflow: "hidden", // importante para o arredondamento funcionar
    elevation: 5, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderTopWidth: 0,
  },
});
