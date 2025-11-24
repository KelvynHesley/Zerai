import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, GRADIENTS, SHADOWS } from "../utils/theme";
import GamingButton from "./GamingButton";

export default function SearchFilterModal({ visible, onClose, onApply }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");

  const platforms = [
    { id: "pc", label: "PC", icon: "desktop-outline" },
    { id: "playstation", label: "PlayStation", icon: "logo-playstation" },
    { id: "xbox", label: "Xbox", icon: "logo-xbox" },
    { id: "nintendo", label: "Nintendo", icon: "game-controller-outline" },
    { id: "mobile", label: "Mobile", icon: "phone-portrait-outline" },
  ];

  const genres = [
    "Ação",
    "Aventura",
    "RPG",
    "Estratégia",
    "FPS",
    "Esportes",
    "Terror",
    "Puzzle",
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevância" },
    { value: "rating", label: "Avaliação" },
    { value: "released", label: "Lançamento" },
    { value: "name", label: "Nome" },
  ];

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleApply = () => {
    onApply({
      platforms: selectedPlatforms,
      genres: selectedGenres,
      sortBy,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setSortBy("relevance");
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Filtros de Busca</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Plataformas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Plataformas</Text>
              <View style={styles.platformsGrid}>
                {platforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <TouchableOpacity
                      key={platform.id}
                      style={[
                        styles.platformChip,
                        isSelected && styles.platformChipSelected,
                      ]}
                      onPress={() => togglePlatform(platform.id)}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={GRADIENTS.primary}
                          style={styles.platformChipGradient}
                        >
                          <Ionicons
                            name={platform.icon}
                            size={24}
                            color={COLORS.textPrimary}
                          />
                          <Text style={styles.platformTextSelected}>
                            {platform.label}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <>
                          <Ionicons
                            name={platform.icon}
                            size={24}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.platformText}>
                            {platform.label}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Gêneros */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gêneros</Text>
              <View style={styles.genresGrid}>
                {genres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <TouchableOpacity
                      key={genre}
                      style={[
                        styles.genreChip,
                        isSelected && styles.genreChipSelected,
                      ]}
                      onPress={() => toggleGenre(genre)}
                    >
                      <Text
                        style={[
                          styles.genreText,
                          isSelected && styles.genreTextSelected,
                        ]}
                      >
                        {genre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Ordenação */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ordenar por</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.sortOption}
                  onPress={() => setSortBy(option.value)}
                >
                  <Text style={styles.sortText}>{option.label}</Text>
                  {sortBy === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Botões */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <GamingButton
                title="Aplicar Filtros"
                onPress={handleApply}
                style={styles.applyButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  platformsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  platformChip: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  platformChipSelected: {
    padding: 0,
  },
  platformChipGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  platformText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "bold",
  },
  platformTextSelected: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  genreChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "20",
  },
  genreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "bold",
  },
  genreTextSelected: {
    color: COLORS.primary,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sortText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  clearButton: {
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  applyButton: {
    flex: 1,
  },
});
