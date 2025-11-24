import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS, SHADOWS } from "../utils/theme";

export default function GamingButton({
  title,
  onPress,
  variant = "primary", // primary, secondary, outline, danger
  icon,
  disabled = false,
  style,
}) {
  const getGradient = () => {
    switch (variant) {
      case "secondary":
        return GRADIENTS.secondary;
      case "danger":
        return [COLORS.error, "#DC2626"];
      default:
        return GRADIENTS.primary;
    }
  };

  if (variant === "outline") {
    return (
      <TouchableOpacity
        style={[styles.outlineButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon}
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={getGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon}
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  outlineButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
