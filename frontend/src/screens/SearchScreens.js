import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import api from "../services/api";

export default function SearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  // savingId controla o loadingzinho no modal enquanto salva
  const [savingId, setSavingId] = useState(null);

  const [selectedGameToAdd, setSelectedGameToAdd] = useState(null);

  const handleSearch = async () => {
    if (searchText.trim().length === 0) return;
    setLoading(true);
    setResults([]);
    try {
      // Usando encodeURIComponent para garantir que espaços e caracteres especiais na busca não quebrem a URL
      const response = await api.get(
        `/search/${encodeURIComponent(searchText)}`
      );
      setResults(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao buscar jogos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  // 1. Abre o modal de escolha de status
  const openAddModal = (gameData) => {
    setSelectedGameToAdd(gameData);
  };

  // 2. Fecha o modal
  const closeAddModal = () => {
    // Só fecha se não estiver salvando no momento
    if (!savingId) {
      setSelectedGameToAdd(null);
    }
  };

  // 3. Função que REALMENTE salva o jogo (chamada pelos botões do modal)
  const confirmAddGame = async (chosenStatus) => {
    const gameData = selectedGameToAdd;
    setSavingId(gameData.rawgId); // Ativa loading no modal

    // Prepara o objeto final para enviar ao backend
    // Junta os dados do jogo da RAWG com o status escolhido
    const payload = {
      ...gameData,
      status: chosenStatus,
    };

    try {
      await api.post("/games", payload);

      // Fecha o modal antes de mostrar o alerta de sucesso
      setSelectedGameToAdd(null);

      Alert.alert(
        "Sucesso!",
        `${gameData.gameTitle} foi adicionado como "${chosenStatus}".`,
        [
          {
            text: "Voltar para Home",
            onPress: () => navigation.goBack(),
          },
          { text: "Buscar mais", style: "cancel" },
        ]
      );
    } catch (error) {
      console.log(error);
      let msg = "Erro ao salvar o jogo.";
      if (error.response && error.response.data && error.response.data.msg) {
        msg = error.response.data.msg;
      }
      Alert.alert("Atenção", msg);
    } finally {
      setSavingId(null); // Desativa o loading
    }
  };

  // ==================================================

  const renderResultItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => openAddModal(item)}
      >
        {item.backgroundImage ? (
          <Image
            source={{ uri: item.backgroundImage }}
            style={styles.resultImage}
          />
        ) : (
          <View style={[styles.resultImage, styles.placeholderImage]}>
            <Text>Sem Imagem</Text>
          </View>
        )}

        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {item.gameTitle}
          </Text>
          <Text style={styles.resultSubtitle}>{item.platforms}</Text>
          <Text style={styles.resultYear}>{item.releaseDate}</Text>
        </View>

        <View style={styles.addButtonAction}>
          <Text style={styles.plusIcon}>+</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddGameModal = () => {
    const statusOptions = [
      { label: "📌 Backlog (Quero Jogar)", value: "Backlog", color: "#888" },
      { label: "🔥 Jogando Agora", value: "Jogando", color: "#007bff" },
      { label: "🏆 Já Zerei (Concluído)", value: "Zerado", color: "#28a745" },
      {
        label: "💤 Só adicionar (Abandonado)",
        value: "Abandonado",
        color: "#dc3545",
      },
    ];

    const isSaving = savingId !== null;

    return (
      <Modal
        animationType="fade" // Fade fica mais elegante aqui
        transparent={true}
        visible={selectedGameToAdd !== null}
        onRequestClose={closeAddModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeAddModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContentCentered}
          >
            <ScrollView>
              {selectedGameToAdd && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Adicionar Jogo</Text>
                    <Text style={styles.modalSubtitle} numberOfLines={2}>
                      {selectedGameToAdd.gameTitle}
                    </Text>
                  </View>

                  <Text style={styles.modalSectionLabelCentered}>
                    Em qual lista deseja salvar?
                  </Text>

                  {isSaving ? (
                    <View style={styles.modalLoading}>
                      <ActivityIndicator size="large" color="#6200ea" />
                      <Text>Adicionando...</Text>
                    </View>
                  ) : (
                    <>
                      {statusOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={styles.statusButton}
                          // Ao clicar, chama a função que confirma passando o valor do status
                          onPress={() => confirmAddGame(option.value)}
                        >
                          <View
                            style={[
                              styles.statusIndicator,
                              { backgroundColor: option.color },
                            ]}
                          />
                          <Text style={styles.statusButtonText}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeAddModal}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Digite o nome do jogo..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.rawgId.toString()}
        renderItem={renderResultItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading &&
          searchText && (
            <Text style={styles.emptyText}>Nenhum jogo encontrado.</Text>
          )
        }
      />

      {renderAddGameModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Estilos existentes permanecem iguais)
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBarContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
    height: 50,
  },
  searchButton: {
    backgroundColor: "#6200ea",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 50,
  },
  searchButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  listContent: { padding: 15 },
  resultCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    alignItems: "center",
  },
  resultImage: { width: 80, height: 100, resizeMode: "cover" },
  placeholderImage: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  resultInfo: { flex: 1, padding: 12 },
  resultTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  resultSubtitle: { fontSize: 13, color: "#666", marginTop: 4 },
  resultYear: { fontSize: 12, color: "#999", marginTop: 4 },
  addButtonAction: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: { fontSize: 24, color: "#6200ea", fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // Um pouco mais escuro
    justifyContent: "center", // Centralizado na tela
    alignItems: "center",
    padding: 20,
  },
  modalContentCentered: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "70%",
    elevation: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6200ea",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
    textAlign: "center",
  },
  modalSectionLabelCentered: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
  },
  statusButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  modalLoading: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
