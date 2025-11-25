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
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { storage } from "../utils/storage";
import { COLORS, GRADIENTS, SHADOWS } from "../utils/theme";
import GamingButton from "../components/GamingButton";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validação de força da senha
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: COLORS.textMuted };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 1)
      return { strength: 20, label: "Fraca", color: COLORS.error };
    if (strength <= 3)
      return { strength: 50, label: "Média", color: COLORS.warning };
    return { strength: 100, label: "Forte", color: COLORS.success };
  };

  const passwordStrength = getPasswordStrength();

  const validateInputs = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Senha Fraca", "A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    const payload = {
      username: username,
      email,
      password,
    };

    setLoading(true);
    try {
      // Registra o usuário
      await api.post("/auth/register", payload);

      // Faz login automático para obter o token
      const loginResponse = await api.post("/auth/login", {
        email,
        password,
      });

      // Salva o token
      await storage.setItem("userToken", loginResponse.data.token);

      Alert.alert(
        "🎮 Bem-vindo ao Zerai!",
        "Sua conta foi criada com sucesso!",
        [
          {
            text: "Começar",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "Home" }] }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Erro no Cadastro",
        error.response?.data?.message ||
          error.response?.data?.msg ||
          "Não foi possível criar a conta."
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.logoSmall}>
                <LinearGradient
                  colors={GRADIENTS.primary}
                  style={styles.logoGradientSmall}
                >
                  <Ionicons
                    name="game-controller"
                    size={32}
                    color={COLORS.textPrimary}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Criar Conta</Text>
              <Text style={styles.headerSubtitle}>
                Junte-se à comunidade de gamers
              </Text>
            </View>
          </View>

          {/* Card de Registro */}
          <View style={styles.formCard}>
            {/* Input Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome de Jogador</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Como devemos te chamar?"
                  placeholderTextColor={COLORS.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
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
                  placeholder="seu@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Input Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
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
                  placeholder="Mínimo 6 caracteres"
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

              {/* Barra de força da senha */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: passwordStrength.color },
                    ]}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Input Confirmar Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Senha</Text>
              <View
                style={[
                  styles.inputContainer,
                  confirmPassword &&
                    password !== confirmPassword &&
                    styles.inputError,
                ]}
              >
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha novamente"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && password !== confirmPassword && (
                <Text style={styles.errorText}>As senhas não coincidem</Text>
              )}
            </View>

            {/* Botão de Registro */}
            {loading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Criando conta...</Text>
              </View>
            ) : (
              <GamingButton
                title="Criar Conta"
                onPress={handleRegister}
                icon={
                  <Ionicons
                    name="rocket-outline"
                    size={20}
                    color={COLORS.textPrimary}
                  />
                }
                style={{ marginTop: 8 }}
              />
            )}

            {/* Termos */}
            <Text style={styles.termsText}>
              Ao criar uma conta, você concorda com nossos{" "}
              <Text style={styles.termsLink}>Termos de Uso</Text>
            </Text>
          </View>

          {/* Link para Login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>
              Já tem uma conta?{" "}
              <Text style={styles.loginTextBold}>Fazer Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Elementos decorativos de fundo */}
      <View style={styles.backgroundDecor1} />
      <View style={styles.backgroundDecor2} />
      <View style={styles.backgroundDecor3} />
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  logoSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    ...SHADOWS.neon,
  },
  logoGradientSmall: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: COLORS.error,
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
  strengthContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.card,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
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
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginTextBold: {
    color: COLORS.primary,
    fontWeight: "bold",
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
  backgroundDecor3: {
    position: "absolute",
    top: "40%",
    right: -100,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.accent,
    opacity: 0.08,
  },
});
