export const COLORS = {
  // Cores principais - Tema Gaming
  primary: "#8B5CF6", // Roxo vibrante
  primaryDark: "#6D28D9", // Roxo escuro
  secondary: "#10B981", // Verde ácido
  accent: "#F59E0B", // Laranja neon

  // Backgrounds
  background: "#0F172A", // Azul escuro quase preto
  surface: "#1E293B", // Cinza azulado
  card: "#334155", // Cinza mais claro

  // Status colors (mantendo a lógica, mas mais vibrantes)
  backlog: "#64748B", // Cinza azulado
  playing: "#3B82F6", // Azul elétrico
  completed: "#10B981", // Verde achievement
  abandoned: "#EF4444", // Vermelho alerta

  // Textos
  textPrimary: "#F1F5F9", // Branco levemente azulado
  textSecondary: "#94A3B8", // Cinza médio
  textMuted: "#64748B", // Cinza escuro

  // Efeitos
  glow: "#8B5CF6", // Para efeitos neon
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
};

export const GRADIENTS = {
  primary: ["#8B5CF6", "#6D28D9"],
  secondary: ["#10B981", "#059669"],
  dark: ["#1E293B", "#0F172A"],
  card: ["#334155", "#1E293B"],
  status: {
    backlog: ["#64748B", "#475569"],
    playing: ["#3B82F6", "#2563EB"],
    completed: ["#10B981", "#059669"],
    abandoned: ["#EF4444", "#DC2626"],
  },
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  neon: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
};

export const FONTS = {
  // Você pode adicionar fontes customizadas depois
  regular: "System",
  bold: "System",
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 32,
  },
};
