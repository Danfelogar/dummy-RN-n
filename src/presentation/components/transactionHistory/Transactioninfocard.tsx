import { View, StyleSheet, TouchableOpacity } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import {
  Receipt,
  Copy,
  CreditCard,
  Landmark,
  Banknote,
} from 'lucide-react-native';
import { Surface, Divider } from 'react-native-paper';

import { PayIn, PayinDTO } from '../../../domain';
import {
  BodyText,
  colors,
  LabelText,
  TitleText,
  widthFullScreen,
} from '../../../shared';
import { TRANSACTION_DETAILS_STRINGS } from '../../screens';
import { StatusBadge } from '../home';

const PAYMENT_METHOD_ICON: Record<string, React.ReactNode> = {
  CARD: <CreditCard size={20} color={colors.primary} />,
  BANK_TRANSFER: <Landmark size={20} color={colors.primary} />,
  CASH: <Banknote size={20} color={colors.primary} />,
};

const formatDetailDate = (date: Date): string => {
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart} ${TRANSACTION_DETAILS_STRINGS.DATE_TIME_SEPARATOR} ${timePart}`;
};

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  noDivider?: boolean;
}

const InfoRow = ({ label, children, noDivider = false }: InfoRowProps) => (
  <>
    <View style={styles.row}>
      <LabelText size="medium" color={colors.onSurfaceVariant}>
        {label}
      </LabelText>
      <View style={styles.rowValue}>{children}</View>
    </View>
    {!noDivider && <Divider style={styles.divider} />}
  </>
);

interface TransactionInfoCardProps {
  transaction: PayIn;
  dto: PayinDTO;
}

export const TransactionInfoCard = ({
  transaction,
  dto,
}: TransactionInfoCardProps) => {
  const handleCopyId = () => {
    Clipboard.setString(transaction.getId());
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardHeader}>
        <TitleText size="large">
          {TRANSACTION_DETAILS_STRINGS.SECTION_TRANSACTION_INFO}
        </TitleText>
        <Receipt size={24} color={colors.onSurfaceVariant} />
      </View>

      <Divider style={styles.headerDivider} />

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_TRANSACTION_ID}>
        <View style={styles.idRow}>
          <View style={styles.idChip}>
            <BodyText
              size="medium"
              color={colors.primaryDark}
              style={styles.idText}
            >
              {transaction.getId().toUpperCase()}
            </BodyText>
          </View>
          <TouchableOpacity
            onPress={handleCopyId}
            activeOpacity={0.7}
            accessibilityLabel={
              TRANSACTION_DETAILS_STRINGS.COPY_ICON_ACCESSIBILITY
            }
          >
            <Copy size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </InfoRow>

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_CUSTOMER_ID}>
        <BodyText size="medium" style={styles.boldValue}>
          {dto.customer_id.toUpperCase()}
        </BodyText>
      </InfoRow>

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_PAYMENT_METHOD}>
        <View style={styles.methodRow}>
          {PAYMENT_METHOD_ICON[transaction.getPaymentMethod()]}
          <BodyText size="medium" style={styles.boldValue}>
            {transaction.getPaymentMethod()}
          </BodyText>
        </View>
      </InfoRow>

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_STATUS}>
        <StatusBadge status={transaction.getStatus()} />
      </InfoRow>

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_AMOUNT}>
        <BodyText size="medium" style={styles.boldValue}>
          {`$${transaction.getAmount().toFixed(2)} ${dto.currency}`}
        </BodyText>
      </InfoRow>

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_DESCRIPTION}>
        <BodyText size="medium" color={colors.onSurface}>
          {transaction.getDescription()}
        </BodyText>
      </InfoRow>

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_CREATED_AT}>
        <BodyText size="medium" color={colors.onSurface}>
          {formatDetailDate(transaction.getCreatedAt())}
        </BodyText>
      </InfoRow>

      <InfoRow label={TRANSACTION_DETAILS_STRINGS.FIELD_UPDATED_AT} noDivider>
        <BodyText size="medium" color={colors.onSurface}>
          {formatDetailDate(new Date(dto.updated_at))}
        </BodyText>
      </InfoRow>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: widthFullScreen * 0.05,
    paddingVertical: widthFullScreen * 0.05,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: widthFullScreen * 0.04,
  },
  headerDivider: {
    backgroundColor: colors.outline,
    marginBottom: widthFullScreen * 0.04,
  },
  divider: {
    backgroundColor: colors.outlineVariant,
    marginVertical: widthFullScreen * 0.035,
  },
  row: {
    gap: widthFullScreen * 0.015,
  },
  rowValue: {
    marginTop: widthFullScreen * 0.01,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthFullScreen * 0.03,
  },
  idChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: widthFullScreen * 0.03,
    paddingVertical: widthFullScreen * 0.015,
    borderRadius: 8,
  },
  idText: {
    fontWeight: '600',
  },
  boldValue: {
    fontWeight: '700',
    color: colors.onSurface,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthFullScreen * 0.025,
  },
});
