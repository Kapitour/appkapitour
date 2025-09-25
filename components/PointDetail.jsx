import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const PointDetail = ({ point, onClose, distance, onFavorite, isFavorite }) => {
  // Função para abrir o Google Maps com as coordenadas do ponto
  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
    Linking.openURL(url);
  };

  // Calcula o tempo estimado (5 min por km, aproximadamente)
  const estimatedTime = Math.round(distance * 5);
  const hours = Math.floor(estimatedTime / 60);
  const minutes = estimatedTime % 60;
  const timeText = hours > 0 
    ? `${hours} h ${minutes} min` 
    : `${minutes} min`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Imagem de fundo */}
      <Image 
        source={{ uri: point.url_img }} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      />
      
      {/* Botões superiores */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.favoriteButton} onPress={onFavorite}>
          <Ionicons 
            name={isFavorite ? "star" : "star-outline"} 
            size={24} 
            color={isFavorite ? "#f7a000" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Card de informações */}
      <View style={styles.infoCard}>
        <View style={styles.contentContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Nome e avaliação */}
            <Text style={styles.title}>{point.nome}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star}
                    name={star <= point.rating ? "star" : "star-outline"} 
                    size={16} 
                    color="#f7a000" 
                    style={styles.starIcon}
                  />
                ))}
              </View>
            </View>
            
            {/* Distância e tempo */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(distance).toFixed(1)} km</Text>
                <Text style={styles.statLabel}>Distância</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{timeText}</Text>
                <Text style={styles.statLabel}>Tempo estimado</Text>
              </View>
            </View>
            
            {/* Descrição */}
            <Text style={styles.description}>
              {point.descricao || `${point.nome} é um local favorito entre moradores e visitantes! Este ponto turístico oferece vistas deslumbrantes e experiências únicas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
            </Text>
            
            {/* Espaço adicional para garantir que o conteúdo role acima dos botões fixos */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
        
        {/* Botões de ação fixos */}
        <View style={styles.fixedActionButtons}>
          <TouchableOpacity style={styles.rateButton}>
            <Text style={styles.buttonText}>Avaliar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navigateButton} onPress={openInMaps}>
            <Text style={styles.buttonText}>Visitar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: '100%',
    height: '45%',
  },
  topButtons: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80, // Espaço para os botões fixos
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 20,
  },
  bottomPadding: {
    height: 20,
  },
  fixedActionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rateButton: {
    flex: 1,
    backgroundColor: '#c3073f',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#2c2338',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PointDetail;