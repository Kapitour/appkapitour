import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getWeatherByCity } from "./weatherApi.js"; 

// ===================================================================
// ✅ 1. SISTEMA DE CLASSIFICAÇÃO DO CLIMA PARA CAPIVARAS
// Esta função analisa os dados do clima e retorna a classificação e imagem da capivara
// ===================================================================
const getCapybaraWeatherInfo = (weatherData) => {
  // Classificação de temperatura
  const temperature = Math.round(weatherData.main.temp);
  let tempCategory;
  if (temperature <= 22) {
    tempCategory = "frio";
  } else if (temperature >= 23 && temperature <= 30) {
    tempCategory = "ameno";
  } else {
    tempCategory = "calor";
  }
  
  // Classificação de condição climática
  const weatherId = weatherData.weather[0].id;
  let weatherCondition;
  
  // Ensolarado ou Céu Limpo (ID 800)
  if (weatherId === 800) {
    weatherCondition = "ensolarado";
  } 
  // Nuvens (IDs 801-804)
  else if (weatherId >= 801 && weatherId <= 804) {
    weatherCondition = "nublado";
  } 
  // Chuva ou Chuvisco (IDs 2xx, 3xx, 5xx)
  else if ((weatherId >= 200 && weatherId <= 232) || 
           (weatherId >= 300 && weatherId <= 321) || 
           (weatherId >= 500 && weatherId <= 531)) {
    weatherCondition = "chuvoso";
  } 
  // Caso não se encaixe em nenhuma condição específica
  else {
    weatherCondition = "variável";
  }
  
  // Classificação de vento
  const windSpeed = weatherData.wind.speed;
  // Convertendo de m/s para km/h (1 m/s = 3.6 km/h)
  const windSpeedKmh = windSpeed * 3.6;
  const isWindy = windSpeedKmh >= 39;
  
  // Definindo a imagem da capivara com base nas condições
  let capybaraImage;
  let capybaraSuggestion;
  
  // Combinações de condições climáticas
  if (tempCategory === "frio") {
    if (weatherCondition === "ensolarado") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/FRIO%20-%20ENSOLARADO.png?raw=true";
        capybaraSuggestion = "Está frio e ensolarado, mas com vento forte! Leve um casaco e protetor solar. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/FRIO%20-%20ENSOLARADO.png?raw=true";
        capybaraSuggestion = "Está frio, mas ensolarado! Leve um casaco e protetor solar. Clique aqui e saiba mais sobre o clima.";
      }
    } else if (weatherCondition === "nublado") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/FRIO%20-%20NUBLADO.png?raw=true";
        capybaraSuggestion = "Está frio, nublado e com vento forte! Leve um casaco bem quente. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/FRIO%20-%20NUBLADO.png?raw=true";
        capybaraSuggestion = "Está frio e nublado! Leve um casaco. Clique aqui e saiba mais sobre o clima.";
      }
    } else if (weatherCondition === "chuvoso") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/FRIO-CHUVA.png?raw=true";
        capybaraSuggestion = "Está frio, chuvoso e com vento forte! Leve um casaco impermeável e guarda-chuva resistente. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/FRIO-CHUVA.png?raw=true";
        capybaraSuggestion = "Está frio e chuvoso! Leve um casaco impermeável e guarda-chuva. Clique aqui e saiba mais sobre o clima.";
      }
    }
  } else if (tempCategory === "ameno") {
    if (weatherCondition === "ensolarado") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO%20-%20ENSOLARADO.png?raw=true";
        capybaraSuggestion = "Temperatura agradável e ensolarado, mas com vento forte! Leve protetor solar e talvez um casaquinho leve. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO%20-%20ENSOLARADO.png?raw=true";
        capybaraSuggestion = "Temperatura perfeita e ensolarado! Não esqueça do protetor solar. Clique aqui e saiba mais sobre o clima.";
      }
    } else if (weatherCondition === "nublado") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO%20-%20NUBLADO.png?raw=true";
        capybaraSuggestion = "Temperatura agradável, nublado e com vento forte! Um casaquinho leve pode ser útil. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO%20-%20NUBLADO.png?raw=true";
        capybaraSuggestion = "Temperatura agradável e nublado! Dia perfeito para passeios ao ar livre. Clique aqui e saiba mais sobre o clima.";
      }
    } else if (weatherCondition === "chuvoso") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO-CHUVA.png?raw=true";
        capybaraSuggestion = "Temperatura agradável, chuvoso e com vento forte! Leve um guarda-chuva resistente. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/AMENO-CHUVA.png?raw=true";
        capybaraSuggestion = "Temperatura agradável e chuvoso! Não esqueça do guarda-chuva. Clique aqui e saiba mais sobre o clima.";
      }
    }
  } else if (tempCategory === "calor") {
    if (weatherCondition === "ensolarado") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/CALOR%20%2B%20ENSOLARADO.png?raw=true";
        capybaraSuggestion = "Está quente, ensolarado e com vento forte! Leve protetor solar, chapéu e muita água. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/CALOR%20%2B%20ENSOLARADO.png?raw=true";
        capybaraSuggestion = "Está muito quente e ensolarado! Protetor solar, chapéu e muita hidratação são essenciais. Clique aqui e saiba mais sobre o clima.";
      }
    } else if (weatherCondition === "nublado") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/CALOR%20%2B%20NUBLADO.png?raw=true";
        capybaraSuggestion = "Está quente, nublado e com vento forte! Mesmo sem sol, mantenha-se hidratado. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/CALOR%20%2B%20NUBLADO.png?raw=true";
        capybaraSuggestion = "Está quente e nublado! Mesmo sem sol, mantenha-se hidratado. Clique aqui e saiba mais sobre o clima.";
      }
    } else if (weatherCondition === "chuvoso") {
      if (isWindy) {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/CALOR%20%2B%20CHUVOSO.png?raw=true";
        capybaraSuggestion = "Está quente, chuvoso e com vento forte! Chuva de verão, leve um guarda-chuva leve. Clique aqui e saiba mais sobre o clima.";
      } else {
        capybaraImage = "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiTempo/MASCULINO/CALOR%20%2B%20CHUVOSO.png?raw=true";
        capybaraSuggestion = "Está quente e chuvoso! Chuva de verão, leve um guarda-chuva leve. Clique aqui e saiba mais sobre o clima.";
      }
    }
  }
  
  // Caso padrão se nenhuma condição específica for atendida
  if (!capybaraImage) {
    capybaraImage = "https://example.com/capybara-default.jpg";
    capybaraSuggestion = "O clima está variável hoje! Esteja preparado para mudanças. Clique aqui e saiba mais sobre o clima.";
  }
  
  return {
    tempCategory,
    weatherCondition,
    isWindy,
    capybaraImage,
    capybaraSuggestion,
    icon: getWeatherIcon(weatherCondition),
    title: getWeatherTitle(tempCategory, weatherCondition, isWindy)
  };
};

// Função auxiliar para obter o ícone com base na condição climática
const getWeatherIcon = (weatherCondition) => {
  switch (weatherCondition) {
    case "ensolarado":
      return "sunny-outline";
    case "nublado":
      return "cloudy-outline";
    case "chuvoso":
      return "rainy-outline";
    default:
      return "information-circle-outline";
  }
};

// Função auxiliar para obter o título com base nas condições
const getWeatherTitle = (tempCategory, weatherCondition, isWindy) => {
  let title = "";
  
  if (tempCategory === "frio") {
    title += "Está Frio";
  } else if (tempCategory === "ameno") {
    title += "Temperatura Agradável";
  } else {
    title += "Está Quente";
  }
  
  if (weatherCondition === "ensolarado") {
    title += " e Ensolarado";
  } else if (weatherCondition === "nublado") {
    title += " e Nublado";
  } else if (weatherCondition === "chuvoso") {
    title += " e Chuvoso";
  }
  
  if (isWindy) {
    title += " com Ventos Fortes";
  }
  
  return title;
};



export default function WeatherScreen({ navigation }) { 
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ✅ 2. NOVO ESTADO PARA GUARDAR AS INFORMAÇÕES DA CAPIVARA
  const [capybaraInfo, setCapybaraInfo] = useState(null);
  // Estado para controlar a exibição de detalhes do clima
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      const data = await getWeatherByCity("Maricá");
      
      if (data) {
        setWeather(data);
        // ✅ 3. AS INFORMAÇÕES DA CAPIVARA SÃO GERADAS E GUARDADAS NO ESTADO
        setCapybaraInfo(getCapybaraWeatherInfo(data));
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

    if (weather && capybaraInfo) {
      return (
        <>
          {/* Card da Capivara com Balão de Fala */}
          <View style={styles.capybaraCard}>
            {/* Balão de fala clicável */}
            <TouchableOpacity 
              style={styles.speechBubble}
              onPress={() => setShowWeatherDetails(!showWeatherDetails)}
            >
              <View style={styles.bubbleHeader}>
                <Ionicons name={capybaraInfo.icon} size={24} color="#fff" />
                <Text style={styles.bubbleTitle}>{capybaraInfo.title}</Text>
              </View>
              <Text style={styles.bubbleText}>{capybaraInfo.capybaraSuggestion}</Text>
            </TouchableOpacity>
            
            {/* Imagem da capivara agora no lado direito */}
            <Image
              source={{ uri: capybaraInfo.capybaraImage }}
              style={styles.capybaraImage}
              // Fallback para uma imagem padrão caso a URL não funcione
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/200x200?text=Capivara";
              }}
            />
          </View>
          
          {/* Detalhes do clima (mostrados apenas quando clicado no balão) */}
          {showWeatherDetails && (
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
                  <Text style={styles.details}>Vento: {Math.round(weather.wind.speed * 3.6)} km/h</Text>
                </View>
              </View>
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
      <ScrollView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.title}>Clima Atual em</Text>
          <Text style={styles.cityTitle}>Maricá</Text>
          {renderContent()}
        </View>

      </ScrollView>
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
    marginTop: 20,
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
  // ✅ Estilos para o Card da Capivara
  capybaraCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  capybaraImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginLeft: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // ✅ Estilos para o Balão de Fala
  speechBubble: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bubbleTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flexShrink: 1,
  },
  bubbleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  }
});