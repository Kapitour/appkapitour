import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

const Loja = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [tiposProduto, setTiposProduto] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Função para limpar e validar URLs de imagem
  const limparUrlImagem = (url) => {
    if (!url) return null;
    
    // Remove espaços e quebras de linha
    let cleanUrl = url.trim();
    
    // Converte URLs do GitHub para formato raw (funciona no React Native)
    if (cleanUrl.includes('github.com') && cleanUrl.includes('/blob/')) {
      cleanUrl = cleanUrl
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/');
    }
    
    // Se não começar com http:// ou https://, adiciona https://
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    return cleanUrl;
  };

  // Função para buscar produtos do Supabase
  const buscarProdutos = async () => {
    try {
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os produtos');
        return;
      }
      
      setProdutos(produtos || []);
      setProdutosFiltrados(produtos || []);
    } catch (error) {
      console.error('Erro na busca de produtos:', error);
      Alert.alert('Erro', 'Erro interno ao carregar produtos');
    }
  };

  // Função para buscar tipos de produto
  const buscarTiposProduto = async () => {
    try {
      const { data: tipos, error } = await supabase
        .from('tipos_produto')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar tipos de produto:', error);
        return;
      }
      
      setTiposProduto(tipos || []);
    } catch (error) {
      console.error('Erro na busca de tipos de produto:', error);
    }
  };

  // Função para buscar estoque
  const buscarEstoque = async () => {
    try {
      const { data: estoque, error } = await supabase
        .from('estoque')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar estoque:', error);
        return;
      }
      
      setEstoque(estoque || []);
    } catch (error) {
      console.error('Erro na busca de estoque:', error);
    }
  };

  // Função para carregar todos os dados
  const carregarDados = async () => {
    setLoading(true);
    await Promise.all([
      buscarProdutos(),
      buscarTiposProduto(),
      buscarEstoque()
    ]);
    setLoading(false);
  };

  // Função para filtrar produtos por tipo
  const filtrarProdutosPorTipo = (tipoId) => {
    if (tipoId === null) {
      // Se tipoId for null, mostra todos os produtos
      setProdutosFiltrados(produtos);
      setTipoSelecionado(null);
    } else {
      // Filtra produtos pelo tipo_id
      const produtosFiltrados = produtos.filter(produto => produto.tipo_id === tipoId);
      setProdutosFiltrados(produtosFiltrados);
      setTipoSelecionado(tipoId);
    }
  };

  // useEffect para carregar dados quando o componente montar
  useEffect(() => {
    carregarDados();
  }, []);

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

  // Função para verificar estoque disponível de um produto
  const verificarEstoque = (produtoId) => {
    const estoqueItem = estoque.find(item => item.produto_id === produtoId);
    return estoqueItem ? estoqueItem.quantidade : 0;
  };

  // Função para obter o nome do tipo de produto
  const obterNomeTipo = (tipoId) => {
    const tipo = tiposProduto.find(tipo => tipo.id === tipoId);
    return tipo ? tipo.nome : 'Categoria não encontrada';
  };

  const renderItem = ({ item }) => {
    const quantidadeEstoque = verificarEstoque(item.id);
    const nomeTipo = obterNomeTipo(item.tipo_id);
    
    return (
      <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
        <Image 
          source={{ 
            uri: limparUrlImagem(item.imagem_url) || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
          }} 
          style={styles.productImage}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{item.nome}</Text>
          <Text style={styles.desc}>{item.descricao}</Text>
          <Text style={styles.category}>Categoria: {nomeTipo}</Text>
          <Text style={styles.stock}>
            Estoque: {quantidadeEstoque > 0 ? `${quantidadeEstoque} unidades` : 'Indisponível'}
          </Text>
          <TouchableOpacity 
            style={[styles.buyBtn, quantidadeEstoque === 0 && styles.buyBtnDisabled]} 
            onPress={() => quantidadeEstoque > 0 ? openModal(item) : null}
            disabled={quantidadeEstoque === 0}
          >
            <Text style={[styles.buyText, quantidadeEstoque === 0 && styles.buyTextDisabled]}>
              {quantidadeEstoque > 0 ? 'Comprar' : 'Indisponível'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f142c", "#c83349", "#f7a000"]}
        start={{ x: 1.5, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.containerPrincipal}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f142c", "#c83349", "#f7a000"]}
      start={{ x: 1.5, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.containerPrincipal}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.wrapper}>
                     <View style={styles.bannerContainer}>
             <Image
               source={{
                 uri: "https://github.com/Kapitour/Imgs-Padr-o/blob/main/KapiStorePainel.png?raw=true",
               }}
               style={styles.banner}
             />
             {/* Gradiente para fazer fade transparente na parte inferior */}
             <LinearGradient
               colors={['rgba(255,255,255,1)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
               locations={[0, 0.6, 1]}
               style={styles.bannerMask}
             />
           </View>

          {/* Filtros por tipo de produto */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterBtn, tipoSelecionado === null && styles.filterBtnActive]}
              onPress={() => filtrarProdutosPorTipo(null)}
            >
              <Text style={[styles.filterText, tipoSelecionado === null && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            {tiposProduto.map((tipo) => (
              <TouchableOpacity
                key={tipo.id}
                style={[styles.filterBtn, tipoSelecionado === tipo.id && styles.filterBtnActive]}
                onPress={() => filtrarProdutosPorTipo(tipo.id)}
              >
                <Text style={[styles.filterText, tipoSelecionado === tipo.id && styles.filterTextActive]}>
                  {tipo.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de produtos */}
          <FlatList
            data={produtosFiltrados}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            numColumns={1}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
              </View>
            }
          />
          
          {/* Espaçamento para evitar sobreposição com a navbar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

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
                <Text style={styles.modalTitle}>{selectedProduct.nome}</Text>
                <Image
                  source={{ 
                    uri: limparUrlImagem(selectedProduct.imagem_url) || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
                  }}
                  style={styles.modalImage}
                />
                <ScrollView>
                  <Text style={styles.modalText}>
                    {selectedProduct.descricao}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Categoria:</Text> {obterNomeTipo(selectedProduct.tipo_id)}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Estoque:</Text> {verificarEstoque(selectedProduct.id)} unidades
                  </Text>
                </ScrollView>
                <TouchableOpacity 
                  style={[styles.buyBtn, verificarEstoque(selectedProduct.id) === 0 && styles.buyBtnDisabled]} 
                  onPress={verificarEstoque(selectedProduct.id) > 0 ? handleBuy : null}
                  disabled={verificarEstoque(selectedProduct.id) === 0}
                >
                  <Text style={[styles.buyText, verificarEstoque(selectedProduct.id) === 0 && styles.buyTextDisabled]}>
                    {verificarEstoque(selectedProduct.id) > 0 ? 'Comprar' : 'Indisponível'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default Loja;

const styles = StyleSheet.create({
  // Estilos principais seguindo o padrão unificado
  containerPrincipal: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  banner: {
    width: "100%",
    aspectRatio: 3, // largura 3x maior que altura
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#c3073f", // Cor unificada com Rotas e DetalhesRotas
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    backgroundColor: "#f7a000", // cor dourada unificada
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  buyText: {
    color: "#fff",
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
    backgroundColor: "#c3073f", // cor unificada
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    marginTop: 15,
    textAlign: "center",
    color: "#f7a000", // cor dourada para o "Fechar"
    fontWeight: "bold",
    fontSize: 16,
  },
  bold: {
    fontWeight: "bold",
  },
  wrapper: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
  // Estilos para loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  // Estilos para filtros melhorados
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  filterBtnActive: {
    backgroundColor: "#f7a000",
    borderColor: "#f7a000",
  },
  filterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Estilos para categoria e estoque
  category: {
    color: "#ccc",
    fontSize: 12,
    marginVertical: 2,
    fontStyle: "italic",
  },
  stock: {
    color: "#fff",
    fontSize: 12,
    marginVertical: 2,
    fontWeight: "500",
  },
  // Estilos para botão desabilitado
  buyBtnDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  buyTextDisabled: {
    color: "#ccc",
  },
  // Estilo para lista vazia
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
  },
  // Espaçamento para evitar sobreposição com navbar
  bottomSpacer: {
    height: 100, // Ajuste conforme a altura da sua navbar
    width: "100%",
  },
});
