import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { storage } from "../utils/storage";
import { COLORS, GRADIENTS, SHADOWS } from "../utils/theme";
import GameCard from "../components/GameCard";
import GamingButton from "../components/GamingButton";

export default function HomeScreen({ navigation }) {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estatísticas gamificadas
  const [stats, setStats] = useState({
    total: 0,
    playing: 0,
    completed: 0,
    backlog: 0,
    level: 1,
    xp: 0,
  });

  const calculateStats = (gamesList) => {
    const stats = {
      total: gamesList.length,
      playing: gamesList.filter((g) => g.status === "Jogando").length,
      completed: gamesList.filter((g) => g.status === "Zerado").length,
      backlog: gamesList.filter((g) => g.status === "Backlog").length,
      // XP simples: 10 pontos por jogo zerado
      xp: gamesList.filter((g) => g.status === "Zerado").length * 10,
    };
    stats.level = Math.floor(stats.xp / 50) + 1; // Level up a cada 50 XP
    return stats;
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await api.get("/games");
      setGames(response.data);
      setFilteredGames(response.data);
      setStats(calculateStats(response.data));
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

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    if (filter === "Todos") {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter((g) => g.status === filter));
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        onPress: async () => {
          await storage.deleteItem("userToken");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  const handleChangeStatus = async (newStatus) => {
    if (selectedGame.status === newStatus) return;

    setActionLoading(true);
    try {
      await api.put(`/games/${selectedGame._id}`, { status: newStatus });
      closeModal();
      fetchGames();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Remover Jogo",
      `Tem certeza que deseja remover "${selectedGame.gameTitle}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: handleDeleteGame,
        },
      ]
    );
  };

  const handleDeleteGame = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/games/${selectedGame._id}`);
      closeModal();
      fetchGames();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível remover o jogo.");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (game) => setSelectedGame(game);
  const closeModal = () => setSelectedGame(null);

  const filters = ["Todos", "Backlog", "Jogando", "Zerado", "Abandonado"];

  const renderHeader = () => (
    <>
      {/* Header com gradiente */}
      <LinearGradient colors={GRADIENTS.dark} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>ZERAI</Text>
            <Text style={styles.headerSubtitle}>Gaming Backlog</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Stats gamificadas */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={GRADIENTS.card} style={styles.statsCard}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LVL {stats.level}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.playing}</Text>
                <Text style={styles.statLabel}>Jogando</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Zerados</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.backlog}</Text>
                <Text style={styles.statLabel}>Backlog</Text>
              </View>
            </View>

            {/* Barra de XP */}
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>{stats.xp} XP</Text>
              <View style={styles.xpBar}>
                <LinearGradient
                  colors={GRADIENTS.secondary}
                  style={[styles.xpFill, { width: `${(stats.xp % 50) * 2}%` }]}
                />
              </View>
              <Text style={styles.xpNext}>
                {50 - (stats.xp % 50)} XP para LVL {stats.level + 1}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => applyFilter(filter)}
              activeOpacity={0.8}
            >
              {selectedFilter === filter ? (
                <LinearGradient
                  colors={GRADIENTS.primary}
                  style={styles.filterChip}
                >
                  <Text style={styles.filterTextActive}>{filter}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterChipInactive}>
                  <Text style={styles.filterTextInactive}>{filter}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  const renderModal = () => {
    if (!selectedGame) return null;

    const statusOptions = [
      { label: "Backlog", emoji: "📚", value: "Backlog" },
      { label: "Jogando Agora", emoji: "🎮", value: "Jogando" },
      { label: "Zerado", emoji: "🏆", value: "Zerado" },
      { label: "Abandonado", emoji: "💤", value: "Abandonado" },
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <LinearGradient
                colors={GRADIENTS.card}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedGame.gameTitle}
                </Text>
                <Text style={styles.modalPlatform}>
                  {selectedGame.platform}
                </Text>
              </LinearGradient>

              {actionLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Processando...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Alterar Status:</Text>
                  {statusOptions.map((option) => {
                    const isCurrentStatus =
                      selectedGame.status === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.statusOption,
                          isCurrentStatus && styles.statusOptionActive,
                        ]}
                        onPress={() => handleChangeStatus(option.value)}
                        disabled={isCurrentStatus}
                      >
                        <Text style={styles.statusEmoji}>{option.emoji}</Text>
                        <Text
                          style={[
                            styles.statusOptionText,
                            isCurrentStatus && styles.statusOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isCurrentStatus && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={COLORS.success}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <View style={styles.modalDivider} />

                  <GamingButton
                    title="Remover Jogo"
                    variant="danger"
                    onPress={confirmDelete}
                    icon={
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={COLORS.textPrimary}
                      />
                    }
                    style={{ marginBottom: 12 }}
                  />

                  <GamingButton
                    title="Fechar"
                    variant="outline"
                    onPress={closeModal}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando seu arsenal...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <GameCard game={item} onPress={() => openModal(item)} />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎮</Text>
              <Text style={styles.emptyTitle}>Nenhum jogo encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Adicione jogos à sua biblioteca!
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB com efeito neon */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Search")}
        activeOpacity={0.8}
      >
        <LinearGradient colors={GRADIENTS.primary} style={styles.fabGradient}>
          <Ionicons name="search" size={28} color={COLORS.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    marginTop: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.medium,
  },
  levelBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    ...SHADOWS.neon,
  },
  levelText: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.card,
  },
  xpContainer: {
    marginTop: 8,
  },
  xpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  xpBar: {
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 4,
  },
  xpNext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: "right",
  },
  filtersContainer: {
    paddingVertical: 16,
    paddingLeft: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  filterChipInactive: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: COLORS.surface,
  },
  filterTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
    fontSize: 14,
  },
  filterTextInactive: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...SHADOWS.neon,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalPlatform: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  statusOptionActive: {
    backgroundColor: COLORS.primary + "33", // 20% opacity
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  statusOptionTextActive: {
    fontWeight: "bold",
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.card,
    marginVertical: 20,
  },
});
