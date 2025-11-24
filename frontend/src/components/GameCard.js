// frontend/src/components/GameCard.js

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS, SHADOWS } from "../utils/theme";

export default function GameCard({ game, onPress }) {
  const getStatusGradient = () => {
    switch (game.status) {
      case "Jogando":
        return GRADIENTS.status.playing;
      case "Zerado":
        return GRADIENTS.status.completed;
      case "Abandonado":
        return GRADIENTS.status.abandoned;
      default:
        return GRADIENTS.status.backlog;
    }
  };

  const getStatusEmoji = () => {
    switch (game.status) {
      case "Jogando":
        return "🎮";
      case "Zerado":
        return "🏆";
      case "Abandonado":
        return "💤";
      default:
        return "📚";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Imagem do jogo */}
        <View style={styles.imageContainer}>
          {game.backgroundImage ? (
            <Image
              source={{ uri: game.backgroundImage }}
              style={styles.image}
            />
          ) : (
            <LinearGradient
              colors={GRADIENTS.dark}
              style={styles.placeholderImage}
            >
              <Text style={styles.placeholderText}>🎮</Text>
            </LinearGradient>
          )}

          {/* Overlay gradient na imagem */}
          <LinearGradient
            colors={["transparent", "rgba(15,23,42,0.9)"]}
            style={styles.imageOverlay}
          />
        </View>

        {/* Informações do jogo */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {game.gameTitle}
          </Text>
          <Text style={styles.platform} numberOfLines={1}>
            {game.platform}
          </Text>

          {/* Badge de status com gradiente */}
          <LinearGradient
            colors={getStatusGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Text style={styles.statusEmoji}>{getStatusEmoji()}</Text>
            <Text style={styles.statusText}>{game.status}</Text>
          </LinearGradient>
        </View>

        {/* Brilho neon no canto */}
        <View style={styles.glowCorner} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  image: {
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
  placeholderText: {
    fontSize: 48,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  platform: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusEmoji: {
    fontSize: 14,
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  glowCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
    borderBottomLeftRadius: 40,
  },
});
