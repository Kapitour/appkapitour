import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import PointDetail from "../components/PointDetail";

// Função para mapear categorias para ícones
const getIconForCategory = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes("praia")) return "umbrella-outline";
  if (name.includes("restaurante") || name.includes("gastronomia")) return "restaurant-outline";
  if (name.includes("hotel") || name.includes("pousada") || name.includes("hospedagem")) return "bed-outline";
  if (name.includes("parque") || name.includes("natureza")) return "leaf-outline";
  if (name.includes("cultura") || name.includes("museu")) return "color-palette-outline";
  if (name.includes("compras") || name.includes("loja")) return "cart-outline";
  if (name.includes("lazer") || name.includes("diversão")) return "game-controller-outline";
  if (name.includes("histórico") || name.includes("monumento")) return "business-outline";
  if (name.includes("esporte")) return "football-outline";
  return "location-outline"; // Ícone padrão
};

export default function Mapa() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [rotaCoords, setRotaCoords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoadingScreen(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
      } finally {
        setLoadingScreen(false);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const cached = await AsyncStorage.getItem("cache:categorias");
        if (cached) {
          const parsed = JSON.parse(cached);
          const isFresh = Date.now() - parsed.ts < 10 * 60 * 1000;
          if (isFresh) setCategorias(parsed.data);
        }
        const { data, error } = await supabase.from("categorias").select("id, nome");
        if (!error && data) {
          setCategorias(data);
          await AsyncStorage.setItem(
            "cache:categorias",
            JSON.stringify({ ts: Date.now(), data })
          );
        }
      } catch (e) {
        // noop
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (!location) return;

    (async () => {
      try {
        const cacheKey = `cache:pontos:${categoriaId ?? "all"}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const isFresh = Date.now() - parsed.ts < 5 * 60 * 1000;
          if (isFresh) setPontos(parsed.data);
        }
        let query = supabase
          .from("pontos_turisticos")
          .select("id, nome, latitude, longitude, descricao, url_img");

        if (categoriaId) {
          const { data: pontoCat } = await supabase
            .from("ponto_categoria")
            .select("ponto_id")
            .eq("categoria_id", categoriaId);
          const ids = (pontoCat || []).map((p) => p.ponto_id);
          if (ids.length === 0) {
            setPontos([]);
            return;
          }
          query = query.in("id", ids);
        }

        const { data: pontosData } = await query;
        const withDistance = (pontosData || []).map((p) => ({
          ...p,
          distance: getDistance(location.latitude, location.longitude, p.latitude, p.longitude),
        }));
        
        // Se tiver categoria selecionada, mostra todos os pontos dessa categoria
        // Se não tiver categoria, mostra apenas os 6 mais próximos
        const pontosToShow = categoriaId 
          ? withDistance.sort((a, b) => a.distance - b.distance)
          : withDistance.sort((a, b) => a.distance - b.distance).slice(0, 6);

        setPontos(pontosToShow);
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: pontosToShow }));
      } catch (e) {
        // noop
      }
    })();
  }, [location, categoriaId]);

  useEffect(() => {
    if (mapRef.current && region && pontos) {
      const coords = pontos.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
      if (location) coords.push({ latitude: location.latitude, longitude: location.longitude });
      if (coords.length > 0) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 60, bottom: 120, left: 60, right: 60 },
          animated: true,
        });
      }
    }
  }, [pontos, location, region]);

  const calcularRota = async (destino) => {
    if (!location) return;
    setLoading(true);
    setSelectedPonto(destino);
    setShowDetailModal(true); // Mostrar o modal de detalhes ao selecionar um ponto
    try {
      const start = [location.longitude, location.latitude];
      const end = [destino.longitude, destino.latitude];
      const apiKey = "5b3ce3597851110001cf62488f306a228c6646caa4fa7ec717441fee";
      const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
        method: "POST",
        headers: { Authorization: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: [start, end] }),
      });
      const data = await response.json();
      if (data?.features?.length > 0) {
        const coords = data.features[0].geometry.coordinates.map((c) => ({ latitude: c[1], longitude: c[0] }));
        setRotaCoords(coords);
        mapRef.current?.fitToCoordinates([{ latitude: location.latitude, longitude: location.longitude }, ...coords], {
          edgePadding: { top: 60, bottom: 140, left: 60, right: 60 },
          animated: true,
        });
      }
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar favorito
  const toggleFavorite = (pontoId) => {
    if (favorites.includes(pontoId)) {
      setFavorites(favorites.filter(id => id !== pontoId));
    } else {
      setFavorites([...favorites, pontoId]);
    }
  };

  if (loadingScreen || !region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c83349" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.categoriesOverlay}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          {categorias.map((cat) => {
            // Mapeamento de ícones por categoria
            const iconName = getIconForCategory(cat.nome);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filtroIcon, categoriaId === cat.id && styles.filtroIconAtivo]}
                onPress={() => setCategoriaId((prev) => (prev === cat.id ? null : cat.id))}
              >
                <Ionicons name={iconName} size={24} color={categoriaId === cat.id ? "#fff" : "#333"} />
                <Text style={[styles.filtroTextoIcon, categoriaId === cat.id && styles.filtroTextoIconAtivo]}>
                  {cat.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <MapView 
        ref={mapRef} 
        style={styles.map} 
        initialRegion={region}
        onPress={() => setSelectedPonto(null)}
      >
        {location && <Marker coordinate={location} title="Você" pinColor="blue" />}
        {pontos.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.nome}
            onPress={(e) => {
              e.stopPropagation();
              calcularRota(p);
            }}
          />
        ))}
        {rotaCoords.length > 0 && <Polyline coordinates={rotaCoords} strokeColor="#FF0000" strokeWidth={4} />}
      </MapView>

      {selectedPonto && !showDetailModal && (
        <Animated.View style={styles.infoCard}>
          {selectedPonto?.url_img ? (
            <Animated.Image
              sharedTransitionTag={`point-image-${selectedPonto.id}`}
              source={{ uri: selectedPonto.url_img }}
              style={styles.img}
              resizeMode="cover"
            />
          ) : null}
          <Animated.Text
            sharedTransitionTag={`point-title-${selectedPonto.id}`}
            style={styles.title}
          >
            {selectedPonto.nome}
          </Animated.Text>
          {selectedPonto?.descricao ? (
            <Text numberOfLines={3} ellipsizeMode="tail" style={styles.desc}>
              {selectedPonto.descricao}
            </Text>
          ) : null}
        </Animated.View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff" }}>Calculando rota...</Text>
        </View>
      )}

      {/* Modal de detalhes do ponto */}
      <Modal
        visible={showDetailModal}
        animationType="none"
        transparent={false}
      >
        {selectedPonto && (
          <PointDetail
            point={selectedPonto}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPonto(null);
              setRotaCoords([]);
            }}
            distance={selectedPonto.distance || 3.4}
            onFavorite={() => toggleFavorite(selectedPonto.id)}
            isFavorite={favorites.includes(selectedPonto.id)}
          />
        )}
      </Modal>
    </View>
  );
}

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f142c" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f142c" },
  categoriesOverlay: { 
    position: "absolute", 
    top: 40, 
    left: 0, 
    right: 0, 
    zIndex: 10,
    paddingVertical: 10
  },
  filtros: { paddingHorizontal: 10 },
  filtroIcon: { 
    backgroundColor: "rgba(255, 255, 255, 0.85)", 
    borderRadius: 12, 
    marginHorizontal: 6,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70
  },
  filtroIconAtivo: { 
    backgroundColor: "#f7a000" 
  },
  filtroTextoIcon: { 
    color: "#333", 
    fontSize: 12, 
    marginTop: 4 
  },
  filtroTextoIconAtivo: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  map: { flex: 1 },
  infoCard: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    backgroundColor: "#2c2338aa",
    borderRadius: 16,
    padding: 14,
    maxHeight: 250, // Limita a altura máxima do card
    marginBottom: 80, // Adiciona espaçamento para o BottomMenu
  },
  img: { width: "100%", height: 120, borderRadius: 10, marginBottom: 8 }, // Reduzindo altura da imagem
  title: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  desc: { color: "#fff", marginTop: 4 },
  loadingOverlay: { position: "absolute", top: "50%", left: "50%", marginLeft: -60, marginTop: -40, backgroundColor: "rgba(0,0,0,0.7)", padding: 20, borderRadius: 10, alignItems: "center" },
});


