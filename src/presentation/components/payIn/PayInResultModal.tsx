import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Text, Button, Divider } from 'react-native-paper';
import { CircleCheck } from 'lucide-react-native';
import { PAY_IN_STRINGS } from '../../screens';
import {
  colors,
  formatDate,
  heightFullScreen,
  isIOS,
  Modal,
  widthFullScreen,
} from '../../../shared';
import { PayInModalState } from '../../hooks';

const formatCurrency = (amount: number) =>
  `${PAY_IN_STRINGS.CURRENCY_SYMBOL}${amount.toFixed(2)} ${
    PAY_IN_STRINGS.CURRENCY_CODE
  }`;

interface PayInResultModalProps {
  state: PayInModalState;
  onDismiss: () => void;
  onViewTransaction?: (transactionId: string) => void;
  onReturnDashboard?: () => void;
}

export const PayInResultModal = ({
  state,
  onDismiss,
  onViewTransaction,
  onReturnDashboard,
}: PayInResultModalProps) => {
  const isSuccess = state.visible && state.status === 'success';
  const isProcessing = state.visible && state.status === 'processing';

  return (
    <Modal
      visibility={state.visible}
      handleDismiss={isProcessing ? () => {} : onDismiss}
      dismissable={!isProcessing}
    >
      <View style={styles.blurWrapper}>
        <View style={styles.content}>
          {isProcessing && (
            <View style={styles.stateContainer}>
              <ActivityIndicator
                size={64}
                color={colors.primary}
                style={styles.spinner}
              />
              <Text variant="headlineSmall" style={styles.stateTitle}>
                {PAY_IN_STRINGS.MODAL_PROCESSING_TITLE}
              </Text>
              <Text variant="bodyMedium" style={styles.stateSubtitle}>
                {PAY_IN_STRINGS.MODAL_PROCESSING_SUBTITLE}
              </Text>
            </View>
          )}

          {isSuccess && state.status === 'success' && (
            <View style={styles.stateContainer}>
              <View style={styles.successIconWrapper}>
                <CircleCheck size={72} color={colors.success} />
              </View>

              <Text variant="headlineMedium" style={styles.stateTitle}>
                {PAY_IN_STRINGS.MODAL_SUCCESS_TITLE}
              </Text>
              <Text variant="bodyMedium" style={styles.stateSubtitle}>
                {PAY_IN_STRINGS.MODAL_SUCCESS_SUBTITLE}
              </Text>

              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>
                    {PAY_IN_STRINGS.MODAL_SUCCESS_TRANSACTION_ID}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {state.transactionId}
                  </Text>
                </View>

                <Divider style={styles.rowDivider} />

                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>
                    {PAY_IN_STRINGS.MODAL_SUCCESS_AMOUNT}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.detailValue, styles.amountText]}
                  >
                    {formatCurrency(state.amount)}
                  </Text>
                </View>

                <Divider style={styles.rowDivider} />

                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>
                    {PAY_IN_STRINGS.MODAL_SUCCESS_DATE}
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {formatDate(state.date)}
                  </Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={() => onViewTransaction?.(state.transactionId)}
                style={styles.primaryButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {PAY_IN_STRINGS.MODAL_SUCCESS_VIEW_TRANSACTION}
              </Button>

              <TouchableOpacity
                onPress={onReturnDashboard ?? onDismiss}
                style={styles.textButton}
                activeOpacity={0.7}
              >
                <Text variant="labelLarge" style={styles.textButtonLabel}>
                  {PAY_IN_STRINGS.MODAL_SUCCESS_RETURN_DASHBOARD}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurWrapper: {
    position: 'absolute',
    top: heightFullScreen * 0.15,
    left: widthFullScreen * 0.07,
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    padding: 28,
    backgroundColor: 'rgba(255,255,255,0.97)',
  },
  stateContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  successIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stateTitle: {
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  stateSubtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: colors.onSurfaceVariant,
  },
  detailValue: {
    color: colors.onSurface,
    fontWeight: '500',
  },
  amountText: {
    fontWeight: '700',
    color: colors.onSurface,
  },
  rowDivider: {
    backgroundColor: colors.outline,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 50,
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textButton: {
    paddingVertical: 8,
  },
  textButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
