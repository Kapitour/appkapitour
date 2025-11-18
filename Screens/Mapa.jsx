import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import PointDetail from "../components/PointDetail";
import { handleError, handleNetworkError } from "../utils/errors";

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
  const webviewRef = useRef(null);
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
  const [webviewReady, setWebviewReady] = useState(false);
  const leafletHtml = `<!DOCTYPE html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css\" /><style>html,body,#map{height:100%;margin:0;padding:0;background:#0f142c}</style></head><body><div id=\"map\"></div><script src=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js\"></script><script>(function(){var map=L.map('map',{zoomControl:true});var base=L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{attribution:'&copy;OpenStreetMap &copy;Carto',maxZoom:19});base.addTo(map);map.setView([0,0],2);var markersLayer=L.layerGroup().addTo(map);var routeLayer=L.polyline([], {color:'#FF0000', weight:4}).addTo(map);var userMarker=null;function clearMarkers(){markersLayer.clearLayers()}function setUserLocation(lat,lon){if(userMarker){map.removeLayer(userMarker)}if(lat!=null&&lon!=null){userMarker=L.circleMarker([lat,lon],{radius:6,color:'#2a93d5',fillColor:'#2a93d5',fillOpacity:1}).addTo(map)}}function setMarkers(pontos){clearMarkers();(pontos||[]).forEach(function(p){var m=L.marker([p.latitude,p.longitude]);m.on('click',function(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'markerClick',id:p.id}))});m.addTo(markersLayer)})}function setRoute(coords){routeLayer.setLatLngs(coords||[]);if(coords&&coords.length>1){var b=L.latLngBounds(coords);map.fitBounds(b,{padding:[40,40]})}}window.receive=function(payloadStr){try{var payload=JSON.parse(payloadStr);if(payload.userLocation){setUserLocation(payload.userLocation.latitude,payload.userLocation.longitude);if(!payload.skipCenter){map.setView([payload.userLocation.latitude,payload.userLocation.longitude],13)}}if(payload.pontos){setMarkers(payload.pontos)}if(payload.rotaCoords){setRoute(payload.rotaCoords)}}catch(e){}};setTimeout(function(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}))},0);})();</script></body></html>`;

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
    if (!webviewReady) return;
    const payload = {
      userLocation: location ? { latitude: location.latitude, longitude: location.longitude } : null,
      pontos,
      skipCenter: false,
    };
    const script = `window.receive(${JSON.stringify(JSON.stringify(payload))}); true;`;
    webviewRef.current?.injectJavaScript(script);
  }, [webviewReady, location, pontos]);

  const abrirDetalhe = (destino) => {
    if (!location) return;
    setSelectedPonto(destino);
    setShowDetailModal(true);
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

      <WebView
        ref={webviewRef}
        style={styles.map}
        originWhitelist={["*"]}
        source={{ html: leafletHtml }}
        onMessage={(ev) => {
          try {
            const msg = JSON.parse(ev.nativeEvent.data);
            if (msg.type === "ready") {
              setWebviewReady(true);
              const payload = {
                userLocation: location ? { latitude: location.latitude, longitude: location.longitude } : null,
                pontos,
                skipCenter: false,
              };
              const script = `window.receive(${JSON.stringify(JSON.stringify(payload))}); true;`;
              webviewRef.current?.injectJavaScript(script);
            } else if (msg.type === "markerClick") {
              const p = pontos.find((pt) => pt.id === msg.id);
              if (p) abrirDetalhe(p);
            }
        } catch {}
      }}
      />

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

      {/* overlay de carregamento removido, não calculamos mais rota */}

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


