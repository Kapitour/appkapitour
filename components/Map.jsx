import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

export default function MapaHome({ categoriaId }) {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [rotaCoords, setRotaCoords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  useEffect(() => {
    if (mapRef.current && pontos.length > 0) {
      const coords = pontos.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      if (location) {
        coords.push({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
        animated: true,
      });
    }
  }, [pontos, location]);

  useEffect(() => {
    if (!location || !categoriaId) return;

    (async () => {
      const { data: pontoCat, error: catError } = await supabase
        .from("ponto_categoria")
        .select("ponto_id")
        .eq("categoria_id", categoriaId);

      if (catError || !pontoCat) {
        console.error("Erro ao buscar ponto_categoria:", catError);
        return;
      }

      const pontoIds = pontoCat.map((pc) => pc.ponto_id);

      if (pontoIds.length === 0) {
        setPontos([]);
        return;
      }

      const { data: pontosData, error: pontosError } = await supabase
        .from("pontos_turisticos")
        .select("id, nome, latitude, longitude, descricao, url_img")
        .in("id", pontoIds);

      if (pontosError) {
        console.error("Erro ao buscar pontos_turisticos:", pontosError);
        return;
      }

      setPontos(pontosData);
    })();
  }, [categoriaId, location]);

  const calcularRota = async (destino) => {
    setLoading(true);
    setSelectedPonto(destino);

    try {
      const start = [location.longitude, location.latitude];
      const end = [destino.longitude, destino.latitude];
      const apiKey = "5b3ce3597851110001cf62488f306a228c6646caa4fa7ec717441fee";

      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coordinates: [start, end] }),
        }
      );

      const data = await response.json();

      if (data?.features?.length > 0) {
        const coords = data.features[0].geometry.coordinates.map((c) => ({
          latitude: c[1],
          longitude: c[0],
        }));

        setRotaCoords(coords);

        mapRef.current?.fitToCoordinates(
          [
            { latitude: location.latitude, longitude: location.longitude },
            ...coords,
          ],
          {
            edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
            animated: true,
          }
        );
      }
    } catch (error) {
      console.error("Erro na rota:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!region || !location)
    return <ActivityIndicator size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>
      {pontos.length === 0 && <Text>Nenhum ponto encontrado</Text>}

      <MapView ref={mapRef} style={styles.map} region={region}>
        <Marker coordinate={location} title="Você" pinColor="blue" />
        {pontos.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.nome}
            pinColor="red"
            onPress={() => calcularRota(p)}
          />
        ))}
        {rotaCoords.length > 0 && (
          <Polyline
            coordinates={rotaCoords}
            strokeColor="#FF0000"
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.infoCard}>
        {selectedPonto ? (
          <>
            <Image
              source={{ uri: selectedPonto.url_img }}
              style={styles.img}
              resizeMode="cover"
            />
            <Text style={styles.title}>{selectedPonto.nome}</Text>
            <Text style={styles.desc}>{selectedPonto.descricao}</Text>
          </>
        ) : (
          <Text style={styles.title}>Selecione um ponto turístico no mapa</Text>
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff" }}>Calculando rota...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    height: 350,
    width: 350,
    borderRadius: 20,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: "#c83349",
    width: 350,
    minHeight: 200,
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "white",
  },
  desc: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 5,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -60,
    marginTop: -40,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
