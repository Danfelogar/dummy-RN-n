import { JSX } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PayIn } from '../../domain';
import { useAppTheme, colors as staticColors } from '../theme';
import { BodyText, LabelText } from './TextGeneric';
import { formatAmount, formatDate, widthFullScreen } from '../utils';
import { StatusBadge } from '../../presentation';

interface TransactionItemProps {
  item: PayIn;
  onPress?: (item: PayIn) => void;
  customKey: number;
}

const PAYMENT_METHOD_ICON: Record<string, string> = {
  CARD: '💳',
  BANK_TRANSFER: '💵',
  CASH: '🍽️',
};

export const TransactionItem = ({
  item,
  customKey,
  onPress,
}: TransactionItemProps): JSX.Element => {
  const { colors } = useAppTheme();
  const isPositive = item.getStatus() !== 'FAILED';
  const amountColor = isPositive ? staticColors.success : staticColors.error;
  const iconBg =
    item.getPaymentMethod() === 'CARD'
      ? staticColors.transactionIconBg
      : staticColors.transactionIconBgNeutral;
  const showTopBorder = customKey !== 0;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(item)}
      activeOpacity={0.75}
      style={[
        styles.row,
        showTopBorder && {
          borderTopWidth: 1,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <LabelText size="large" style={styles.icon}>
          {PAYMENT_METHOD_ICON[item.getPaymentMethod()] ?? '💳'}
        </LabelText>
      </View>

      <View style={styles.info}>
        <BodyText
          size="medium"
          color={colors.onSurface}
          style={styles.description}
        >
          {item.getDescription()}
        </BodyText>
        <View style={styles.meta}>
          <LabelText size="small" color={colors.onSurfaceVariant}>
            {`${formatDate(item.getCreatedAt())} • ${item
              .getId()
              .toUpperCase()}`}
          </LabelText>
        </View>
        <StatusBadge status={item.getStatus()} />
      </View>

      <BodyText size="medium" color={amountColor} style={styles.amount}>
        {formatAmount(item.getAmount(), item.getStatus())}
      </BodyText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: widthFullScreen * 0.04,
    gap: widthFullScreen * 0.035,
  },
  iconContainer: {
    width: widthFullScreen * 0.12,
    height: widthFullScreen * 0.12,
    borderRadius: widthFullScreen * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: widthFullScreen * 0.055,
  },
  info: {
    flex: 1,
    gap: widthFullScreen * 0.01,
  },
  description: {
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amount: {
    fontWeight: '700',
    marginTop: widthFullScreen * 0.005,
  },
});
