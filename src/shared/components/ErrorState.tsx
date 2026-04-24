import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from 'react-native-paper';

import { TRANSACTION_HISTORY_STRINGS } from '../../presentation';
import { colors } from '../theme';
import { heightFullScreen, widthFullScreen } from '../utils';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => (
  <View style={styles.emptyContainer}>
    <Text variant="titleMedium" style={styles.emptyTitle}>
      {TRANSACTION_HISTORY_STRINGS.ERROR_STATE_TITLE}
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      {TRANSACTION_HISTORY_STRINGS.ERROR_STATE_BODY}
    </Text>
    <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
      <Text variant="labelLarge" style={{ color: colors.primary }}>
        {TRANSACTION_HISTORY_STRINGS.ERROR_STATE_BTN}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: heightFullScreen * 0.08,
    gap: widthFullScreen * 0.02,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});
