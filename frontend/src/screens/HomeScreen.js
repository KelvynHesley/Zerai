import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar as RNStatusBar,
  Modal, // ✅ NOVO IMPORT
  ScrollView, // ✅ NOVO IMPORT (para o conteúdo do modal se a tela for pequena)
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import { storage } from "../utils/storage";

export default function HomeScreen({ navigation }) {
  const [groupedGames, setGroupedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmptyList, setIsEmptyList] = useState(false);

  // ✅ NOVOS ESTADOS PARA A FASE B ✅
  // Guarda o objeto completo do jogo que foi clicado. Se for null, o modal fecha.
  const [selectedGame, setSelectedGame] = useState(null);
  // Controla o loadingzinho dentro do modal enquanto salva/deleta
  const [actionLoading, setActionLoading] = useState(false);

  // --- (Função groupGamesByStatus permanece IGUAL) ---
  const groupGamesByStatus = (gamesList) => {
    if (!gamesList || gamesList.length === 0) {
      setIsEmptyList(true);
      return [];
    }
    setIsEmptyList(false);
    const sectionsMap = {
      Jogando: { title: "Jogando Agora 🔥", data: [] },
      Backlog: { title: "No Backlog 📚", data: [] },
      Zerado: { title: "Zerados (Concluídos) 🏆", data: [] },
      Abandonado: { title: "Abandonados zzz", data: [] },
    };
    gamesList.forEach((game) => {
      if (sectionsMap[game.status]) {
        sectionsMap[game.status].data.push(game);
      }
    });
    return Object.values(sectionsMap).filter(
      (section) => section.data.length > 0
    );
  };

  // --- (Função fetchGames permanece IGUAL) ---
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await api.get("/games");
      const groupedData = groupGamesByStatus(response.data);
      setGroupedGames(groupedData);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar seus jogos.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGames();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await storage.deleteItem("userToken");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer logout.");
    }
  };

  // 1. Abre o modal para um jogo específico
  const openModal = (game) => {
    setSelectedGame(game);
  };

  // 2. Fecha o modal
  const closeModal = () => {
    setSelectedGame(null);
  };

  // 3. Chama a API para mudar o status (PUT)
  const handleChangeStatus = async (newStatus) => {
    // Se o status já for o atual, não faz nada
    if (selectedGame.status === newStatus) return;

    setActionLoading(true);
    try {
      await api.put(`/games/${selectedGame._id}`, { status: newStatus });
      // Sucesso! Fecha o modal e recarrega a lista para ver a mudança
      closeModal();
      fetchGames();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Pede confirmação e deleta o jogo (DELETE)
  const confirmDelete = () => {
    Alert.alert(
      "Remover Jogo",
      `Tem certeza que deseja remover "${selectedGame.gameTitle}" da sua lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Remover",
          style: "destructive", // Fica vermelho no iOS
          onPress: handleDeleteGame, // Chama a função real se confirmar
        },
      ]
    );
  };

  const handleDeleteGame = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/games/${selectedGame._id}`);
      closeModal();
      fetchGames(); // Recarrega a lista para o jogo sumir
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível remover o jogo.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==================================================

  const renderGameItem = ({ item }) => {
    let statusColor = "#888";
    if (item.status === "Jogando") statusColor = "#007bff";
    if (item.status === "Zerado") statusColor = "#28a745";
    if (item.status === "Abandonado") statusColor = "#dc3545";

    return (
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => openModal(item)} // ✅ MUDANÇA: Agora abre o modal
      >
        {item.backgroundImage ? (
          <Image
            source={{ uri: item.backgroundImage }}
            style={styles.gameImage}
          />
        ) : (
          <View style={[styles.gameImage, styles.placeholderImage]}>
            <Text>Sem Imagem</Text>
          </View>
        )}
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle} numberOfLines={2}>
            {item.gameTitle}
          </Text>
          <Text style={styles.gamePlatform}>{item.platform}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderGameOptionsModal = () => {
    // Lista de status possíveis para gerar os botões
    const statusOptions = [
      { label: "📌 Mover para Backlog", value: "Backlog", color: "#888" },
      { label: "🔥 Jogando Agora", value: "Jogando", color: "#007bff" },
      { label: "🏆 Marcar como Zerado", value: "Zerado", color: "#28a745" },
      { label: "💤 Abandonar", value: "Abandonado", color: "#dc3545" },
    ];

    return (
      <Modal
        animationType="slide" // Sobe da parte inferior
        transparent={true} // Fundo transparente escuro
        visible={selectedGame !== null} // Só aparece se tiver um jogo selecionado
        onRequestClose={closeModal} // Botão voltar do Android fecha o modal
      >
        {/* Fundo escuro que fecha o modal ao clicar */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          {/* O conteúdo do modal em si (clicar aqui não fecha) */}
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <ScrollView>
              {selectedGame && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                      {selectedGame.gameTitle}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Status atual: {selectedGame.status}
                    </Text>
                  </View>

                  {actionLoading ? (
                    <View style={styles.modalLoading}>
                      <ActivityIndicator size="large" color="#6200ea" />
                      <Text>Salvando...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.modalSectionLabel}>
                        Alterar Status:
                      </Text>
                      {/* Gera os botões de status */}
                      {statusOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          // Se for o status atual, o botão fica "apagado" (disabled)
                          style={[
                            styles.statusButton,
                            selectedGame.status === option.value &&
                              styles.disabledButton,
                          ]}
                          onPress={() => handleChangeStatus(option.value)}
                          disabled={selectedGame.status === option.value}
                        >
                          {/* Bolinha colorida ao lado do texto */}
                          <View
                            style={[
                              styles.statusIndicator,
                              { backgroundColor: option.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusButtonText,
                              selectedGame.status === option.value &&
                                styles.disabledButtonText,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}

                      <View style={styles.divider} />

                      <Text style={styles.modalSectionLabel}>
                        Ações de Perigo:
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={confirmDelete}
                      >
                        <Text style={styles.deleteButtonText}>
                          🗑️ Remover Jogo da Lista
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.cancelButtonText}>Fechar Menu</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  // --- Renderização Principal ---
  return (
    <View style={styles.container}>
      {/* ... Header, Loadings, SectionList permanecem IGUAIS ... */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Backlog</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200ea" />
        </View>
      ) : isEmptyList ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Sua lista está vazia.</Text>
          <Text style={styles.emptySubtitle}>Adicione jogos para começar!</Text>
        </View>
      ) : (
        <SectionList
          sections={groupedGames}
          keyExtractor={(item) => item._id}
          renderItem={renderGameItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Search")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {renderGameOptionsModal()}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  // ... (Estilos anteriores permanecem IGUAIS: container, header, etc.)
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: (RNStatusBar.currentHeight || 20) + 10,
    backgroundColor: "#fff",
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#6200ea" },
  logoutText: { color: "#ff3b30", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#555" },
  emptySubtitle: { fontSize: 14, color: "#888", marginTop: 5 },
  listContent: { paddingHorizontal: 15, paddingBottom: 80 },
  sectionHeaderContainer: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    marginTop: 5,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  gameCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameImage: { width: 90, height: 110, resizeMode: "cover" },
  placeholderImage: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  gameInfo: { flex: 1, padding: 10, justifyContent: "space-between" },
  gameTitle: { fontSize: 15, fontWeight: "bold", color: "#333" },
  gamePlatform: { fontSize: 13, color: "#666", marginTop: 2 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 30,
    backgroundColor: "#6200ea",
    borderRadius: 30,
    elevation: 8,
    zIndex: 999,
  },
  fabText: { fontSize: 32, color: "#fff", fontWeight: "bold", marginTop: -4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Fundo preto semitransparente
    justifyContent: "flex-end", // Alinha o modal no fundo da tela
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%", // Ocupa no máximo 80% da tela
    elevation: 20,
  },
  modalHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modalSectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 10,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: "#e0e0e0", // Mais claro se estiver desabilitado
    opacity: 0.7,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusButtonText: {
    fontSize: 16,
    color: "#333",
  },
  disabledButtonText: {
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee", // Vermelho bem claro
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#d32f2f", // Vermelho escuro
    fontWeight: "bold",
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
