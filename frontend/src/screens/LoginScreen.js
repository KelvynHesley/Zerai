import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { storage } from "../utils/storage";
import { COLORS, GRADIENTS, SHADOWS } from "../utils/theme";
import GamingButton from "../components/GamingButton";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animação simples para o título
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      await storage.setItem("userToken", response.data.token);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro no Login",
        error.response?.data?.message || "Credenciais inválidas."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.dark} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo e título animados */}
          <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.logoGradient}
              >
                <Ionicons
                  name="game-controller"
                  size={60}
                  color={COLORS.textPrimary}
                />
              </LinearGradient>
            </View>

            <Text style={styles.title}>ZERAI</Text>
            <Text style={styles.subtitle}>Gaming Backlog Manager</Text>

            {/* Decoração */}
            <View style={styles.decorationLine}>
              <View style={styles.decorationDot} />
              <View style={styles.decorationBar} />
              <View style={styles.decorationDot} />
            </View>
          </Animated.View>

          {/* Card de Login */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Entrar na Conta</Text>

            {/* Input de Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Input de Senha */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Botão de Login */}
            {loading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Entrando...</Text>
              </View>
            ) : (
              <GamingButton
                title="Entrar"
                onPress={handleLogin}
                icon={
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={COLORS.textPrimary}
                  />
                }
                style={{ marginTop: 8 }}
              />
            )}

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.divider} />
            </View>

            {/* Link para Registro */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.7}
            >
              <Text style={styles.registerText}>
                Não tem uma conta?{" "}
                <Text style={styles.registerTextBold}>Criar Conta</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer decorativo */}
          <View style={styles.footer}>
            <View style={styles.footerDots}>
              <View style={[styles.footerDot, { opacity: 0.3 }]} />
              <View style={[styles.footerDot, { opacity: 0.5 }]} />
              <View style={[styles.footerDot, { opacity: 1 }]} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Elementos decorativos de fundo */}
      <View style={styles.backgroundDecor1} />
      <View style={styles.backgroundDecor2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    ...SHADOWS.neon,
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    letterSpacing: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  decorationLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  decorationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  decorationBar: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: 8,
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.card,
  },
  dividerText: {
    color: COLORS.textMuted,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "bold",
  },
  registerLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  registerTextBold: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerDots: {
    flexDirection: "row",
    gap: 8,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  backgroundDecor1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  backgroundDecor2: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
  },
});
