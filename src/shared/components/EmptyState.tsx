import { StyleSheet, View } from 'react-native';

import { Text } from 'react-native-paper';

import { TRANSACTION_HISTORY_STRINGS } from '../../presentation';
import { colors } from '../theme';
import { heightFullScreen, widthFullScreen } from '../utils';

export const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text variant="titleMedium" style={styles.emptyTitle}>
      {TRANSACTION_HISTORY_STRINGS.EMPTY_TITLE}
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      {TRANSACTION_HISTORY_STRINGS.EMPTY_SUBTITLE}
    </Text>
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
});
