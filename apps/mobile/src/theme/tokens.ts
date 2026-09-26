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
    primary: '#F4F7F5',
    secondary: '#EAF0EC',
    tertiary: '#E7EDE9',
    card: '#FFFFFF',
    modal: '#FFFFFF',
  },
  text: {
    primary: '#17211B',
    secondary: '#34453B',
    tertiary: '#5D6C63',
    inverse: '#FFFFFF',
    muted: '#77877E',
  },
  brand: {
    primary: '#0F6B4F',
    primaryHover: '#0B5B42',
    primaryLight: '#DDF3E9',
    accent: '#1D4ED8',
    accentLight: '#DBEAFE',
  },
  semantic: {
    income: '#067647',
    incomeLight: '#DDF3E9',
    expense: '#B42318',
    expenseLight: '#FEE4E2',
    warning: '#B54708',
    warningLight: '#FEF0C7',
    info: '#1D4ED8',
    infoLight: '#DBEAFE',
  },
  border: {
    subtle: '#E7EDE9',
    default: '#D5DFD9',
    strong: '#B8C7BE',
  },
  surface: {
    overlay: 'rgba(15, 23, 19, 0.48)',
    input: '#FFFFFF',
    divider: '#E7EDE9',
  },
};

export const darkColors: ColorSchemeTokens = {
  background: {
    primary: '#0C0D10',
    secondary: '#121316',
    tertiary: '#1B1B1F',
    card: '#17181C',
    modal: '#1F1F23',
  },
  text: {
    primary: '#F3F4F6',
    secondary: '#C4C7C9',
    tertiary: '#8E9193',
    inverse: '#191C1E',
    muted: '#707477',
  },
  brand: {
    primary: '#F3F4F6',
    primaryHover: '#E1E2E4',
    primaryLight: '#292A2D',
    accent: '#6366F1',
    accentLight: '#24254D',
  },
  semantic: {
    income: '#4EDEA3',
    incomeLight: '#15382E',
    expense: '#FFB4AB',
    expenseLight: '#4A1D20',
    warning: '#F6C177',
    warningLight: '#493619',
    info: '#C0C1FF',
    infoLight: '#24254D',
  },
  border: {
    subtle: '#292A2D',
    default: '#343538',
    strong: '#444749',
  },
  surface: {
    overlay: 'rgba(12, 13, 16, 0.82)',
    input: '#1B1B1F',
    divider: '#292A2D',
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

/**
 * Width breakpoints in dp, named for the device class rather than the number so
 * a screen reads as an intent. `compact` is the smallest phone worth designing
 * for (a 320 dp device with the OS font scale turned up); `expanded` is where a
 * single column stops being the right shape and content needs a max width.
 */
export const breakpoints = {
  compact: 360,
  medium: 480,
  expanded: 840,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Widest a single column of reading content is allowed to get, in dp. */
export const layout = {
  /** Full-width horizontal padding on a compact phone. */
  gutter: spacing.lg,
  /** Full-width horizontal padding once there is room to breathe. */
  gutterWide: spacing.xxl,
  /** Content column cap, so text is not a 900 dp line on a tablet. */
  maxContentWidth: 640,
  /** Two-up grid cap, used by the dashboard stat tiles. */
  maxGridWidth: 720,
  /** Minimum touch target. Below this, a control is hard to hit one-handed. */
  minTouchTarget: 48,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 8,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  h1: { fontFamily: fontFamily.semibold, fontSize: 34, lineHeight: 40 },
  h2: { fontFamily: fontFamily.semibold, fontSize: 26, lineHeight: 32 },
  h3: { fontFamily: fontFamily.medium, fontSize: 22, lineHeight: 28 },
  h4: { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 24 },
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  mono: { fontSize: 13, fontFamily: fontFamily.medium, lineHeight: 18 },
} as const;
