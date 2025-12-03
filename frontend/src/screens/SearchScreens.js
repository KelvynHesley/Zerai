import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  Animated,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { COLORS, GRADIENTS, SHADOWS } from "../utils/theme";
import GamingButton from "../components/GamingButton";

// Componente de Skeleton Loading
const SkeletonCard = () => {
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
        <View style={styles.skeletonBadge} />
      </View>
    </Animated.View>
  );
};

// Componente de Card de Jogo na Busca
const SearchGameCard = ({ game, onAdd, isAdding }) => {
  const platforms = game.platforms || "N/A";
  const rating = game.rating || 0;

  return (
    <View style={styles.gameCard}>
      <View style={styles.gameImageContainer}>
        {game.backgroundImage ? (
          <Image
            source={{ uri: game.backgroundImage }}
            style={styles.gameImage}
          />
        ) : (
          <LinearGradient
            colors={GRADIENTS.dark}
            style={styles.placeholderImage}
          >
            <Ionicons
              name="game-controller-outline"
              size={40}
              color={COLORS.textMuted}
            />
          </LinearGradient>
        )}

        {/* Rating badge */}
        {rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={2}>
          {game.gameTitle || game.name}
        </Text>
        <Text style={styles.gamePlatforms} numberOfLines={1}>
          {platforms}
        </Text>

        {/* Tags/Genres */}
        {game.releaseDate && (
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>📅 {game.releaseDate}</Text>
            </View>
          </View>
        )}

        {/* Botão de adicionar */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAdd(game)}
          disabled={isAdding}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isAdding ? ["#555", "#444"] : GRADIENTS.primary}
            style={styles.addButtonGradient}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={COLORS.textPrimary}
                />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingGameId, setAddingGameId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedGameToAdd, setSelectedGameToAdd] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Backlog");

  // Debounce para não fazer requisição a cada tecla
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      handleSearch();
    } else if (debouncedQuery.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const handleSearch = async () => {
    if (!debouncedQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await api.get(
        `/search/${encodeURIComponent(debouncedQuery.trim())}`
      );

      const validGames = (response.data || []).filter(
        (game) => game && game.rawgId
      );
      setSearchResults(validGames);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível buscar jogos.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (game) => {
    setSelectedGameToAdd(game);
    setShowStatusModal(true);
  };

  const confirmAddGame = async () => {
    if (!selectedGameToAdd) return;

    const game = selectedGameToAdd;
    setAddingGameId(game.rawgId);
    setShowStatusModal(false);

    try {
      const payload = {
        rawgId: game.rawgId,
        gameTitle: game.gameTitle,
        platforms: game.platforms,
        backgroundImage: game.backgroundImage || "",
        status: selectedStatus,
      };

      await api.post("/games", payload);

      Alert.alert(
        "🎮 Jogo Adicionado!",
        `${game.gameTitle} foi adicionado como "${selectedStatus}".`,
        [
          { text: "Ok" },
          {
            text: "Ver Backlog",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        "Não foi possível adicionar o jogo.";
      Alert.alert("Erro", message);
    } finally {
      setAddingGameId(null);
      setSelectedGameToAdd(null);
    }
  };

  // Cancela a adição
  const cancelAddGame = () => {
    setShowStatusModal(false);
    setSelectedGameToAdd(null);
    setSelectedStatus("Backlog");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderEmptyState = () => {
    if (loading) return null;

    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.emptyIconGradient}
            >
              <Ionicons name="search" size={48} color={COLORS.textPrimary} />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Procure seu jogo</Text>
          <Text style={styles.emptySubtitle}>
            Digite o nome de um jogo para começar a busca
          </Text>

          {/* Sugestões populares */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Populares:</Text>
            <View style={styles.suggestionsChips}>
              {["The Witcher 3", "GTA V", "Minecraft", "Elden Ring"].map(
                (suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={styles.suggestionChip}
                    onPress={() => setSearchQuery(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum jogo encontrado</Text>
          <Text style={styles.emptySubtitle}>Tente buscar com outro nome</Text>
        </View>
      );
    }

    return null;
  };

  // Renderiza o modal de seleção de status
  const renderStatusModal = () => {
    if (!selectedGameToAdd) return null;

    const statusOptions = [
      { value: "Backlog", emoji: "📚", label: "Backlog", color: "#64748B" },
      {
        value: "Jogando",
        emoji: "🎮",
        label: "Jogando Agora",
        color: "#3B82F6",
      },
      { value: "Zerado", emoji: "🏆", label: "Zerado", color: "#10B981" },
      {
        value: "Abandonado",
        emoji: "💤",
        label: "Abandonado",
        color: "#EF4444",
      },
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStatusModal}
        onRequestClose={cancelAddGame}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContent}>
            {/* Header do Modal */}
            <View style={styles.statusModalHeader}>
              <View style={styles.gamePreview}>
                {selectedGameToAdd.backgroundImage ? (
                  <Image
                    source={{ uri: selectedGameToAdd.backgroundImage }}
                    style={styles.gamePreviewImage}
                  />
                ) : (
                  <View style={styles.gamePreviewPlaceholder}>
                    <Ionicons
                      name="game-controller-outline"
                      size={32}
                      color={COLORS.textMuted}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.statusModalTitle} numberOfLines={2}>
                {selectedGameToAdd.gameTitle}
              </Text>
              <Text style={styles.statusModalSubtitle}>
                Escolha o status inicial:
              </Text>
            </View>

            {/* Opções de Status */}
            <View style={styles.statusOptionsContainer}>
              {statusOptions.map((option) => {
                const isSelected = selectedStatus === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOptionButton,
                      isSelected && styles.statusOptionButtonSelected,
                    ]}
                    onPress={() => setSelectedStatus(option.value)}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={[option.color, option.color + "DD"]}
                        style={styles.statusOptionGradient}
                      >
                        <Text style={styles.statusOptionEmoji}>
                          {option.emoji}
                        </Text>
                        <Text style={styles.statusOptionTextSelected}>
                          {option.label}
                        </Text>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={COLORS.textPrimary}
                        />
                      </LinearGradient>
                    ) : (
                      <View style={styles.statusOptionContent}>
                        <Text style={styles.statusOptionEmoji}>
                          {option.emoji}
                        </Text>
                        <Text style={styles.statusOptionText}>
                          {option.label}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botões de Ação */}
            <View style={styles.statusModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelAddGame}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmAddGame}
                disabled={addingGameId !== null}
              >
                <LinearGradient
                  colors={GRADIENTS.primary}
                  style={styles.confirmButtonGradient}
                >
                  {addingGameId ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.textPrimary}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="add-circle"
                        size={20}
                        color={COLORS.textPrimary}
                      />
                      <Text style={styles.confirmButtonText}>Adicionar</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header com gradiente */}
      <LinearGradient colors={GRADIENTS.dark} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buscar Jogos</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Barra de busca */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: The Last of Us, Zelda..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info de resultados */}
        {hasSearched && !loading && (
          <Text style={styles.resultsInfo}>
            {searchResults.length}{" "}
            {searchResults.length === 1 ? "resultado" : "resultados"}{" "}
            encontrados
          </Text>
        )}
      </LinearGradient>

      {/* Lista de resultados */}
      <FlatList
        data={loading ? [1, 2, 3, 4] : searchResults}
        keyExtractor={(item, index) =>
          loading
            ? `skeleton-${index}`
            : `game-${item.rawgId ? item.rawgId : "no-id"}-${index}`
        }
        renderItem={({ item }) =>
          loading ? (
            <SkeletonCard />
          ) : (
            <SearchGameCard
              game={item}
              onAdd={openStatusModal}
              isAdding={addingGameId === item.rawgId}
            />
          )
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Elementos decorativos de fundo */}
      <View style={styles.backgroundDecor1} />
      <View style={styles.backgroundDecor2} />

      {/* Modal de seleção de status */}
      {renderStatusModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...SHADOWS.medium,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  headerPlaceholder: {
    width: 44,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  resultsInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // Game Card
  gameCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  gameImageContainer: {
    width: 120,
    height: 160,
    position: "relative",
  },
  gameImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  gameInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  gamePlatforms: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },

  // Skeleton Loading
  skeletonCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    height: 160,
  },
  skeletonImage: {
    width: 120,
    backgroundColor: COLORS.card,
  },
  skeletonContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-around",
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    width: "80%",
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    width: "60%",
  },
  skeletonBadge: {
    height: 24,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    width: "40%",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.neon,
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
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginTop: 40,
    width: "100%",
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  suggestionsChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  suggestionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  // Background Decorations
  backgroundDecor1: {
    position: "absolute",
    top: 200,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },
  backgroundDecor2: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.secondary,
    opacity: 0.05,
  },

  // Modal de Status
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statusModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    ...SHADOWS.neon,
  },
  statusModalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  gamePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  gamePreviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gamePreviewPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  statusModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  statusModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  statusOptionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  statusOptionButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  statusOptionButtonSelected: {
    borderColor: "transparent",
  },
  statusOptionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  statusOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.card,
  },
  statusOptionEmoji: {
    fontSize: 24,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "bold",
  },
  statusOptionTextSelected: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  statusModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  confirmButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
