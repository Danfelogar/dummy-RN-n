import { View, StyleSheet, TouchableOpacity } from 'react-native';

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react-native';
import React from 'react';
import Toast, {
  ToastConfig,
  ToastConfigParams,
} from 'react-native-toast-message';

import { ToastType, TOAST_STRINGS } from './toast.strings';
import { colors } from '../../theme';
import { widthFullScreen } from '../../utils';
import { BodyText, TitleText } from '../TextGeneric';

interface ToastVisualConfig {
  icon: React.ReactNode;
  accentColor: string;
  backgroundColor: string;
  titleColor: string;
}

const TOAST_VISUAL_CONFIG: Record<ToastType, ToastVisualConfig> = {
  success: {
    icon: <CheckCircle2 size={24} color={colors.success} strokeWidth={2.2} />,
    accentColor: colors.success,
    backgroundColor: colors.surface,
    titleColor: colors.onSurface,
  },
  error: {
    icon: <XCircle size={24} color={colors.error} strokeWidth={2.2} />,
    accentColor: colors.error,
    backgroundColor: colors.surface,
    titleColor: colors.onSurface,
  },
  warning: {
    icon: <AlertTriangle size={24} color={colors.warning} strokeWidth={2.2} />,
    accentColor: colors.warning,
    backgroundColor: colors.surface,
    titleColor: colors.onSurface,
  },
  info: {
    icon: <Info size={24} color={colors.primary} strokeWidth={2.2} />,
    accentColor: colors.primary,
    backgroundColor: colors.surface,
    titleColor: colors.onSurface,
  },
};

const renderToast =
  (type: ToastType) =>
  ({ text1, text2, onPress, hide }: ToastConfigParams<unknown>) => {
    const visual = TOAST_VISUAL_CONFIG[type];

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress ?? hide}
        style={[
          styles.container,
          { backgroundColor: visual.backgroundColor },
          { borderLeftColor: visual.accentColor },
        ]}
      >
        <View style={styles.iconWrapper}>{visual.icon}</View>

        <View style={styles.textBlock}>
          {text1 ? (
            <TitleText size="small" color={visual.titleColor}>
              {text1}
            </TitleText>
          ) : null}
          {text2 ? (
            <BodyText size="small" color={colors.onSurfaceVariant}>
              {text2}
            </BodyText>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => hide?.()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeButton}
        >
          <X size={16} color={colors.onSurfaceVariant} strokeWidth={2} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

export const toastConfig: ToastConfig = {
  success: renderToast(TOAST_STRINGS.TYPE_SUCCESS as ToastType),
  error: renderToast(TOAST_STRINGS.TYPE_ERROR as ToastType),
  warning: renderToast(TOAST_STRINGS.TYPE_WARNING as ToastType),
  info: renderToast(TOAST_STRINGS.TYPE_INFO as ToastType),
};

export const AppToast = () => (
  <Toast
    config={toastConfig}
    visibilityTime={4000}
    autoHide
    topOffset={widthFullScreen * 0.12}
    bottomOffset={widthFullScreen * 0.08}
  />
);

interface ShowToastParams {
  type: ToastType;
  title?: string;
  body?: string;
  duration?: number;
  position?: 'top' | 'bottom';
  onPress?: () => void;
}

const DEFAULT_TITLES: Record<ToastType, string> = {
  success: TOAST_STRINGS.DEFAULT_TITLE_SUCCESS,
  error: TOAST_STRINGS.DEFAULT_TITLE_ERROR,
  warning: TOAST_STRINGS.DEFAULT_TITLE_WARNING,
  info: TOAST_STRINGS.DEFAULT_TITLE_INFO,
};

const DEFAULT_BODIES: Record<ToastType, string> = {
  success: TOAST_STRINGS.DEFAULT_BODY_SUCCESS,
  error: TOAST_STRINGS.DEFAULT_BODY_ERROR,
  warning: TOAST_STRINGS.DEFAULT_BODY_WARNING,
  info: TOAST_STRINGS.DEFAULT_BODY_INFO,
};

export const showToast = ({
  type,
  title,
  body,
  duration = 4000,
  position = 'top',
  onPress,
}: ShowToastParams) => {
  Toast.show({
    type,
    text1: title ?? DEFAULT_TITLES[type],
    text2: body ?? DEFAULT_BODIES[type],
    visibilityTime: duration,
    position,
    onPress,
  });
};

export const hideToast = () => Toast.hide();

const styles = StyleSheet.create({
  container: {
    width: widthFullScreen * 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthFullScreen * 0.03,
    paddingVertical: widthFullScreen * 0.035,
    paddingHorizontal: widthFullScreen * 0.04,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: widthFullScreen * 0.005,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
