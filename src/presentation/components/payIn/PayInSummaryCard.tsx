import { View, StyleSheet } from 'react-native';

import React from 'react';
import { Text } from 'react-native-paper';

import { colors } from '../../../shared';
import { PAY_IN_STRINGS } from '../../screens';

interface PayInSummaryCardProps {
  feeEstimate: number;
  totalCharge: number;
}

const formatCurrency = (value: number) =>
  `${PAY_IN_STRINGS.CURRENCY_SYMBOL}${value.toFixed(2)}`;

export const PayInSummaryCard = ({
  feeEstimate,
  totalCharge,
}: PayInSummaryCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text variant="bodyMedium" style={styles.label}>
          {PAY_IN_STRINGS.FEE_ESTIMATE_LABEL}
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {formatCurrency(feeEstimate)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text variant="bodyMedium" style={styles.label}>
          {PAY_IN_STRINGS.TOTAL_CHARGE_LABEL}
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.value, { color: colors.primary, fontWeight: '700' }]}
        >
          {formatCurrency(totalCharge)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.onSurfaceVariant,
  },
  value: {
    color: colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
  },
});
