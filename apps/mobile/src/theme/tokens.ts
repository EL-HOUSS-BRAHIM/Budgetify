export interface ColorSchemeTokens {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    modal: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    muted: string;
  };
  brand: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    accent: string;
    accentLight: string;
  };
  semantic: {
    income: string;
    incomeLight: string;
    expense: string;
    expenseLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  surface: {
    overlay: string;
    input: string;
    divider: string;
  };
}

export const lightColors: ColorSchemeTokens = {
  background: {
    primary: '#F8FAFC',
    secondary: '#F1F5F9',
    tertiary: '#E2E8F0',
    card: '#FFFFFF',
    modal: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#334155',
    tertiary: '#64748B',
    inverse: '#FFFFFF',
    muted: '#94A3B8',
  },
  brand: {
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#D1FAE5',
    accent: '#4F46E5',
    accentLight: '#EEF2FF',
  },
  semantic: {
    income: '#10B981',
    incomeLight: '#ECFDF5',
    expense: '#EF4444',
    expenseLight: '#FEF2F2',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
  },
  border: {
    subtle: '#F1F5F9',
    default: '#E2E8F0',
    strong: '#CBD5E1',
  },
  surface: {
    overlay: 'rgba(15, 23, 42, 0.4)',
    input: '#FFFFFF',
    divider: '#E2E8F0',
  },
};

export const darkColors: ColorSchemeTokens = {
  background: {
    primary: '#0B0F19',
    secondary: '#111827',
    tertiary: '#1F2937',
    card: '#161F30',
    modal: '#1A2438',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    inverse: '#0F172A',
    muted: '#64748B',
  },
  brand: {
    primary: '#10B981',
    primaryHover: '#34D399',
    primaryLight: '#064E3B',
    accent: '#6366F1',
    accentLight: '#312E81',
  },
  semantic: {
    income: '#34D399',
    incomeLight: '#064E3B',
    expense: '#F87171',
    expenseLight: '#7F1D1D',
    warning: '#FBBF24',
    warningLight: '#78350F',
    info: '#60A5FA',
    infoLight: '#1E3A8A',
  },
  border: {
    subtle: '#1E293B',
    default: '#334155',
    strong: '#475569',
  },
  surface: {
    overlay: 'rgba(0, 0, 0, 0.7)',
    input: '#161F30',
    divider: '#1E293B',
  },
};

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 30, fontWeight: '700' as const, lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  mono: { fontSize: 14, fontFamily: 'monospace', lineHeight: 20 },
} as const;
