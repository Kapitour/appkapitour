import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const products = [
  {
    id: 1,
    title: "Camiseta Kapitour",
    description: "Camiseta de algodão confortável",
    price: 49.9,
    images: [
      "https://github.com/Kapitour/Imgs-Padr-o/blob/main/Produtos/blusa1frente.png?raw=true",
      "https://github.com/Kapitour/Imgs-Padr-o/blob/main/Produtos/blusa2costas.png?raw=true",
    ],
    details: {
      sizes: ["P", "M", "G", "GG", "XG", "XGG"],
      colors: ["Preto"],
      material: "100% Algodão",
    },
  },
  {
    id: 2,
    title: "KapriSilha",
    description: "Mini Presilhas de capivaras",
    price: 4.9,
    images: [
      "https://img.kwcdn.com/product/open/dac6f20ab3d24bddaf3dd7780e2b1d58-goods.jpeg?imageView2/2/w/800/q/70/format/webp",
    ],
    details: {
      sizes: ["Diferentes Modelos"],
      colors: ["Única"],
      material: "Plástico",
    },
  },
];

const Loja = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigation = useNavigation();

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleBuy = () => {
    closeModal();
    navigation.navigate("Login"); // certifique-se que a rota 'Login' existe
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.buyBtn} onPress={() => openModal(item)}>
          <Text style={styles.buyText}>Comprar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.wrapper}>
        <Image
          source={{
            uri: "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiStorePainel.png?raw=true",
          }}
          style={styles.banner}
        />

        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          numColumns={1}
          scrollEnabled={false}
        />
      </View>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        numColumns={1}
        scrollEnabled={false}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                <Image
                  source={{ uri: selectedProduct.images[0] }}
                  style={styles.modalImage}
                />
                <ScrollView>
                  <Text style={styles.modalText}>
                    {selectedProduct.description}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Preço:</Text> R${" "}
                    {selectedProduct.price.toFixed(2)}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Tamanhos:</Text>{" "}
                    {selectedProduct.details.sizes.join(", ")}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Cores:</Text>{" "}
                    {selectedProduct.details.colors.join(", ")}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Material:</Text>{" "}
                    {selectedProduct.details.material}
                  </Text>
                </ScrollView>
                <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
                  <Text style={styles.buyText}>Comprar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Loja;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212", // cor de fundo escura
  },
  banner: {
    width: "100%",
    aspectRatio: 3, // largura 3x maior que altura
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "rgba(201, 52, 52, 0.9)", // mantivemos esse tom avermelhado com opacidade
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  info: {
    padding: 16,
  },
  title: {
    color: "#fff", // texto claro para contrastar com fundo escuro
    fontSize: 18,
    fontWeight: "bold",
  },
  desc: {
    color: "#fff", // texto claro
    fontSize: 14,
    marginVertical: 6,
  },
  price: {
    color: "#fff", // texto claro
    fontSize: 16,
    fontWeight: "bold",
  },
  buyBtn: {
    marginTop: 10,
    backgroundColor: "#fff", // botão com fundo branco para destacar no fundo escuro
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buyText: {
    color: "rgba(201, 52, 52, 0.9)", // tom de vermelho suave
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // fundo escuro com opacidade
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#1c1c1c", // fundo escuro para o modal
    borderRadius: 10,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff", // título claro
  },
  modalImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 6,
    color: "#ccc", // cor de texto claro
  },
  closeText: {
    marginTop: 10,
    textAlign: "center",
    color: "#C93434", // vermelho para o "Fechar"
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  wrapper: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
});
