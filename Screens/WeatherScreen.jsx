import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getWeatherByCity } from "./weatherApi.js"; 

// ===================================================================
// ✅ 1. A NOVA CENTRAL DE DICAS CRIATIVAS
// Esta função analisa os dados do clima e retorna uma sugestão personalizada.
// ===================================================================
const getWeatherSuggestion = (weatherData) => {
  const weatherId = weatherData.weather[0].id;

  // Clima Ensolarado ou Céu Limpo (IDs 800)
  if (weatherId === 800) {
    return {
      icon: "sunny-outline",
      title: "Dia de Ouro em Maricá!",
      text: "O sol está brilhando! É o dia perfeito para curtir as praias de Itaipuaçu ou Ponta Negra. Não se esqueça do protetor solar!"
    };
  }
  // Nuvens (IDs 801-804)
  if (weatherId >= 801 && weatherId <= 804) {
    return {
      icon: "cloudy-outline",
      title: "Clima Agradável e Suave",
      text: "O tempo está nublado, ideal para uma caminhada na orla da lagoa ou para explorar o centrinho da cidade sem o calor intenso."
    };
  }
  // Chuva ou Chuvisco (IDs 2xx, 3xx, 5xx)
  if ((weatherId >= 200 && weatherId <= 531)) {
    return {
      icon: "rainy-outline",
      title: "Aconchego e Descobertas",
      text: "A chuva chegou! Que tal explorar a gastronomia local em um dos restaurantes do Polo Gastronômico da Rua 4, ou visitar a Casa de Cultura?"
    };
  }
  // Névoa, Neblina (IDs 7xx)
  if (weatherId >= 701 && weatherId <= 781) {
    return {
      icon: "reorder-three-outline",
      title: "Cenário Misterioso",
      text: "A névoa cria uma atmosfera única para fotos incríveis na Restinga de Maricá. Tenha cuidado extra nas estradas e na serra!"
    };
  }
  // Caso padrão
  return {
    icon: "information-circle-outline",
    title: "Aproveite o Dia!",
    text: "Confira a previsão detalhada acima e planeje o melhor roteiro para aproveitar Maricá hoje."
  };
};


export default function WeatherScreen({ navigation }) { 
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ✅ 2. NOVO ESTADO PARA GUARDAR A DICA
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      const data = await getWeatherByCity("Maricá");
      
      if (data) {
        setWeather(data);
        // ✅ 3. A DICA É GERADA E GUARDADA NO ESTADO
        setSuggestion(getWeatherSuggestion(data));
      } else {
        setError("Não foi possível buscar o clima. Tente novamente mais tarde.");
      }
      setLoading(false);
    };

    fetchWeather();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#fff" style={styles.feedbackView} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (weather) {
      return (
        <>
          <View style={styles.resultCard}>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png` }}
              style={styles.weatherIcon}
            />
            <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
            <Text style={styles.description}>{weather.weather[0].description}</Text>
            <View style={styles.divider} />
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={24} color="#fff" />
                <Text style={styles.details}>Umidade: {weather.main.humidity}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="leaf-outline" size={24} color="#fff" />
                <Text style={styles.details}>Vento: {weather.wind.speed} m/s</Text>
              </View>
            </View>
          </View>
          
          {/* ✅ 4. CARD DE DICA CRIATIVA RENDERIZADO NA TELA */}
          {suggestion && (
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <Ionicons name={suggestion.icon} size={24} color="#fff" />
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              </View>
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
            </View>
          )}
        </>
      );
    }
    
    return null;
  };

  return (
    <LinearGradient 
      colors={["#c83349", "#0f142c"]} 
      style={styles.safeArea}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.title}>Clima Atual em</Text>
          <Text style={styles.cityTitle}>Maricá</Text>
          {renderContent()}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    alignItems: "center", 
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 50,
  },
  cityTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20, // Reduzi um pouco a margem
  },
  feedbackView: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 50,
    color: '#ffdddd',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  resultCard: { 
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  weatherIcon: {
    width: 150,
    height: 150,
    marginTop: -50,
  },
  temp: { 
    fontSize: 64,
    fontWeight: "bold", 
    color: "#fff",
    marginTop: -20,
  },
  description: {
    fontSize: 20,
    textTransform: 'capitalize',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 15,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
  },
  details: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  // ✅ 5. ESTILOS PARA O NOVO CARD DE DICAS
  suggestionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Um pouco mais escuro para diferenciar
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginTop: 25, // Espaçamento entre os cards
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  suggestionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  suggestionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    lineHeight: 22, // Melhora a legibilidade
  }
});