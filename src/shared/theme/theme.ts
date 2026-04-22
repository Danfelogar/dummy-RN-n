import { MD3LightTheme, useTheme as usePaperTheme } from 'react-native-paper';

import { colors } from './colors';

export const theme = {
  ...MD3LightTheme,
  // Dark mode flag
  dark: false,
  // Round corners for modern look
  roundness: 12,
  // Custom colors
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    onPrimary: colors.onPrimary,
    onPrimaryContainer: colors.primaryDark,
    // Secondary colors (using primary variants)
    secondary: colors.primaryDark,
    secondaryContainer: colors.primaryLight,
    onSecondary: colors.onPrimary,
    onSecondaryContainer: colors.primary,
    // Tertiary colors (accents)
    tertiary: colors.success,
    tertiaryContainer: '#D1FAE5',
    onTertiary: colors.onPrimary,
    onTertiaryContainer: '#065F46',
    // Error colors
    error: colors.error,
    errorContainer: '#FEE2E2',
    onError: colors.onPrimary,
    onErrorContainer: '#991B1B',
    // Background colors
    background: colors.background,
    onBackground: colors.onSurface,
    // Surface colors
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    // Surface disabled
    surfaceDisabled: colors.disabled,
    onSurfaceDisabled: colors.onSurfaceVariant,
    // Outline colors
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
    // Inverse colors (for snackbars, etc)
    inverseSurface: colors.onSurface,
    inverseOnSurface: colors.surface,
    inversePrimary: colors.primaryLight,
    // Shadow
    shadow: '#000000',
    scrim: colors.backdrop,
    // Backdrop
    backdrop: colors.backdrop,
    // Elevation (shadows)
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  // Animation configuration
  animation: {
    scale: 1.0,
  },
};

// Type for theme
export type AppTheme = typeof theme;

export const useAppTheme = () => usePaperTheme<AppTheme>();
