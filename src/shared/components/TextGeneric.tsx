import { Text } from 'react-native-paper';
import { BodyTextProps, LabelTextProps, TitleTextProps } from './interfaces';

/**
 * TitleText - Bold text component for headings and titles
 *
 * @example
 * <TitleText size="large">Main Title</TitleText>
 * <TitleText size="medium" color="#FF0000">Subtitle</TitleText>
 * <TitleText size="small">Small Title</TitleText>
 */
export function TitleText({
  children,
  size = 'medium',
  style,
  theme,
  numberOfLines,
  color,
}: TitleTextProps) {
  const variantMap = {
    large: 'titleLarge' as const,
    medium: 'titleMedium' as const,
    small: 'titleSmall' as const,
  };

  const fontSizeMap = {
    large: 22,
    medium: 18,
    small: 16,
  };

  return (
    <Text
      variant={variantMap[size]}
      style={[
        {
          fontFamily: 'Roboto-Bold',
          fontWeight: '700',
          fontSize: fontSizeMap[size],
          color: color,
        },
        style,
      ]}
      theme={theme}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

/**
 * BodyText - Regular/Normal weight text for body content
 *
 * @example
 * <BodyText size="large">Important paragraph</BodyText>
 * <BodyText size="medium">Regular paragraph</BodyText>
 * <BodyText size="small" color="#666">Small description</BodyText>
 */
export function BodyText({
  children,
  size = 'medium',
  style,
  theme,
  numberOfLines,
  color,
}: BodyTextProps) {
  const variantMap = {
    large: 'bodyLarge' as const,
    medium: 'bodyMedium' as const,
    small: 'bodySmall' as const,
  };

  const fontSizeMap = {
    large: 16,
    medium: 14,
    small: 12,
  };

  return (
    <Text
      variant={variantMap[size]}
      style={[
        {
          fontFamily: 'Roboto-Regular',
          fontWeight: '400',
          fontSize: fontSizeMap[size],
          color: color,
        },
        style,
      ]}
      theme={theme}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

/**
 * LabelText - Thin weight text for labels, hints, and secondary info
 *
 * @example
 * <LabelText size="large">Form Label</LabelText>
 * <LabelText size="medium" color="#999">Hint text</LabelText>
 * <LabelText size="small">Caption</LabelText>
 */
export function LabelText({
  children,
  size = 'medium',
  style,
  theme,
  numberOfLines,
  color,
}: LabelTextProps) {
  const variantMap = {
    large: 'labelLarge' as const,
    medium: 'labelMedium' as const,
    small: 'labelSmall' as const,
  };

  const fontSizeMap = {
    large: 14,
    medium: 12,
    small: 11,
  };

  return (
    <Text
      variant={variantMap[size]}
      style={[
        {
          fontFamily: 'Roboto-Thin',
          fontWeight: '100',
          fontSize: fontSizeMap[size],
          color: color,
        },
        style,
      ]}
      theme={theme}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
