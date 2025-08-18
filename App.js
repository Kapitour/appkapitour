import React, { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// Telas
import Home from "./Screens/Home";
import Login from "./Screens/Login";
import Rotas from "./Screens/Rotas";
import Loja from "./Screens/Loja";
import Contato from "./Screens/Contato";
import Cadastro from "./Screens/Cadastro";
import AreaUsuario from "./Screens/AreaUsuario";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de autenticação
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="AreaUsuario" component={AreaUsuario} />
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
            <Icon name="home-outline" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Conta"
        component={AuthStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="person-outline" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Rotas"
        component={Rotas}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="navigate-outline" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Loja"
        component={Loja}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="cart-outline" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Contato"
        component={Contato}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="call-outline" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
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
