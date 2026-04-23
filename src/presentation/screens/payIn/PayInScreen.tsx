import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { Info, WifiOff } from 'lucide-react-native';
import { colors } from '../../../shared/theme/colors';
import { usePayInForm } from '../../hooks';
import { PAY_IN_STRINGS } from './payIn.string';
import {
  PayInResultModal,
  PayInSummaryCard,
  PaymentMethodSelector,
} from '../../components';
import {
  heightFullScreen,
  InputGeneric,
  isIOS,
  StandardWrapper,
} from '../../../shared';
import { HOME_STRINGS } from '../home';

export const PayInScreen = () => {
  const {
    form,
    feeEstimate,
    totalCharge,
    availableBalance,
    modalState,
    isOnline,
    onSubmit,
    dismissModal,
  } = usePayInForm();

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <StandardWrapper>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={isIOS() ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Offline notice */}
          {!isOnline ? (
            <Surface style={styles.offlineBanner} elevation={0}>
              <View style={styles.infoBannerInner}>
                <WifiOff
                  size={22}
                  color={colors.warning}
                  style={styles.infoIcon}
                />
                <View style={styles.infoBannerText}>
                  <Text
                    variant="labelLarge"
                    style={[styles.infoBannerTitle, { color: colors.warning }]}
                  >
                    {PAY_IN_STRINGS.INFO_BANNER_TITLE_OFFLINE}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.warning, opacity: 0.85 }}
                  >
                    {PAY_IN_STRINGS.INFO_BANNER_SUBTITLE}
                  </Text>
                </View>
              </View>
            </Surface>
          ) : (
            <Surface style={styles.infoBanner} elevation={0}>
              <View style={styles.infoBannerInner}>
                <Info
                  size={22}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <View style={styles.infoBannerText}>
                  <Text
                    variant="labelLarge"
                    style={[
                      styles.infoBannerTitle,
                      { color: colors.primaryDark },
                    ]}
                  >
                    {PAY_IN_STRINGS.INFO_BANNER_TITLE}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.primaryDark, opacity: 0.8 }}
                  >
                    {PAY_IN_STRINGS.INFO_BANNER_SUBTITLE}
                  </Text>
                </View>
              </View>
            </Surface>
          )}

          {/* Available balance indicator */}
          <View style={styles.balanceRow}>
            <Text variant="bodySmall" style={styles.balanceLabel}>
              {HOME_STRINGS.availableBalance}
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.balanceValue,
                {
                  color: availableBalance <= 0 ? colors.error : colors.success,
                },
              ]}
            >
              ${availableBalance.toFixed(2)} USD
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              {PAY_IN_STRINGS.AMOUNT_LABEL}
            </Text>
            <InputGeneric
              control={control}
              name="amount"
              label={PAY_IN_STRINGS.AMOUNT_LABEL}
              placeholder={PAY_IN_STRINGS.AMOUNT_PLACEHOLDER}
              keyboardType="decimal-pad"
              leftIcon="currency-usd"
              activeOutlineColor={colors.primary}
            />
            {errors.amount && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.amount.message}
              </Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              {PAY_IN_STRINGS.CUSTOMER_ID_LABEL}
            </Text>
            <InputGeneric
              control={control}
              name="customer_id"
              label={PAY_IN_STRINGS.CUSTOMER_ID_LABEL}
              placeholder={PAY_IN_STRINGS.CUSTOMER_ID_PLACEHOLDER}
              keyboardType="number-pad"
              rightIcon={errors.customer_id ? 'alert-circle' : undefined}
              activeOutlineColor={colors.primary}
              outlineColor={errors.customer_id ? colors.error : '#E5E7EB'}
            />
            {errors.customer_id && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.customer_id.message}
              </Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <PaymentMethodSelector control={control} name="payment_method" />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              {PAY_IN_STRINGS.DESCRIPTION_LABEL}
            </Text>
            <InputGeneric
              control={control}
              name="description"
              label={PAY_IN_STRINGS.DESCRIPTION_LABEL}
              placeholder={PAY_IN_STRINGS.DESCRIPTION_PLACEHOLDER}
              multiline
              numberOfLines={4}
              activeOutlineColor={colors.primary}
            />
          </View>

          <PayInSummaryCard
            feeEstimate={feeEstimate}
            totalCharge={totalCharge}
          />

          <Button
            mode="contained"
            onPress={onSubmit}
            style={[
              styles.submitButton,
              !isOnline && { backgroundColor: colors.warning },
            ]}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonLabel}
            icon={isOnline ? 'plus-circle' : 'clock-outline'}
          >
            {isOnline
              ? PAY_IN_STRINGS.CREATE_PAY_IN_BUTTON
              : PAY_IN_STRINGS.CREATE_PAY_IN_BUTTON_OFFLINE}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      {modalState.visible && (
        <PayInResultModal
          state={modalState}
          onDismiss={dismissModal}
          onReturnDashboard={dismissModal}
        />
      )}
    </StandardWrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: heightFullScreen * 0.1,
    gap: 20,
  },
  infoBanner: {
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    padding: 14,
  },
  offlineBanner: {
    borderRadius: 14,
    backgroundColor: colors.warningLight ?? '#FFF3CD',
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  infoBannerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoBannerText: {
    flex: 1,
    gap: 4,
  },
  infoBannerTitle: {
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  balanceLabel: {
    color: colors.onSurfaceVariant,
  },
  balanceValue: {
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    marginTop: 2,
    marginLeft: 2,
  },
  submitButton: {
    borderRadius: 50,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.onPrimary,
  },
});
