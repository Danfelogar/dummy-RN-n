import { StyleProp, TextStyle } from 'react-native';
import type { ThemeProp } from 'react-native-paper/lib/typescript/types';

export type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

export type FontWeight = 'thin' | 'regular' | 'bold';

export interface CustomTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
  theme?: ThemeProp;
  numberOfLines?: number;
  color?: string;
}

export interface TitleTextProps extends Omit<CustomTextProps, 'variant'> {
  size?: 'large' | 'medium' | 'small';
}

export interface BodyTextProps extends Omit<CustomTextProps, 'variant'> {
  size?: 'large' | 'medium' | 'small';
}

export interface LabelTextProps extends Omit<CustomTextProps, 'variant'> {
  size?: 'large' | 'medium' | 'small';
}
