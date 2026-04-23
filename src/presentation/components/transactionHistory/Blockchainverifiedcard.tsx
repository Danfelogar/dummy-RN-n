import { View, StyleSheet } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { ShieldCheck } from 'lucide-react-native';

import { TRANSACTION_DETAILS_STRINGS } from '../../screens';
import { BodyText, colors, TitleText, widthFullScreen } from '../../../shared';

interface BlockchainVerifiedCardProps {
  hash?: string;
  onViewReceipt?: () => void;
}

export const BlockchainVerifiedCard = ({
  hash = TRANSACTION_DETAILS_STRINGS.BLOCKCHAIN_HASH_MOCK,
  onViewReceipt,
}: BlockchainVerifiedCardProps) => {
  return (
    <Surface style={styles.card} elevation={0}>
      <View style={styles.infoRow}>
        <View style={styles.iconWrapper}>
          <ShieldCheck size={28} color={colors.onPrimary} strokeWidth={2.5} />
        </View>

        <View style={styles.textBlock}>
          <TitleText size="small">
            {TRANSACTION_DETAILS_STRINGS.SECTION_BLOCKCHAIN}
          </TitleText>
          <BodyText size="small" color={colors.onSurfaceVariant}>
            {TRANSACTION_DETAILS_STRINGS.BLOCKCHAIN_SUBTITLE}
          </BodyText>
          <BodyText size="small" color={colors.onSurfaceVariant}>
            {`${TRANSACTION_DETAILS_STRINGS.BLOCKCHAIN_HASH_PREFIX} ${hash}`}
          </BodyText>
        </View>
      </View>

      <Button
        mode="outlined"
        onPress={onViewReceipt}
        style={styles.receiptButton}
        contentStyle={styles.receiptButtonContent}
        labelStyle={styles.receiptButtonLabel}
        textColor={colors.primary}
      >
        {TRANSACTION_DETAILS_STRINGS.VIEW_NETWORK_RECEIPT}
      </Button>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: widthFullScreen * 0.05,
    paddingVertical: widthFullScreen * 0.045,
    gap: widthFullScreen * 0.04,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: widthFullScreen * 0.04,
  },
  iconWrapper: {
    width: widthFullScreen * 0.13,
    height: widthFullScreen * 0.13,
    borderRadius: widthFullScreen * 0.065,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: widthFullScreen * 0.008,
  },
  receiptButton: {
    borderRadius: 50,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  receiptButtonContent: {
    paddingVertical: widthFullScreen * 0.015,
  },
  receiptButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
