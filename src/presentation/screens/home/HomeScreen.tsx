import { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, StandardWrapper, widthFullScreen } from '../../../shared';
import {
  ActiveGoalsCard,
  BalanceCard,
  PayInSnackbar,
  RecentActivity,
  SummaryRow,
} from '../../components';
import { PayIn, PayinDTO, PayInMapper } from '../../../domain';
import { BottomTabsParams } from '../../navigation';

const MOCK_TRANSACTIONS: PayinDTO[] = [
  {
    id: 'txn_001a2b3c',
    idempotency_key: 'idem_seed_001',
    customer_id: 'cust_john_doe',
    amount: 150.0,
    currency: 'USD',
    payment_method: 'CARD',
    status: 'PROCESSED',
    description: 'Subscription renewal - Pro plan',
    failure_reason: null,
    encrypted_payload: null,
    created_at: '2025-04-01T10:23:00.000Z',
    updated_at: '2025-04-01T10:23:45.000Z',
  },
  {
    id: 'txn_002d4e5f',
    idempotency_key: 'idem_seed_002',
    customer_id: 'cust_jane_smith',
    amount: 320.5,
    currency: 'USD',
    payment_method: 'BANK_TRANSFER',
    status: 'PROCESSED',
    description: 'Invoice payment INV-2025-042',
    failure_reason: null,
    encrypted_payload: null,
    created_at: '2025-04-03T14:05:00.000Z',
    updated_at: '2025-04-03T14:05:52.000Z',
  },
  {
    id: 'txn_003g6h7i',
    idempotency_key: 'idem_seed_003',
    customer_id: 'cust_carlos_m',
    amount: 75.99,
    currency: 'USD',
    payment_method: 'CASH',
    status: 'FAILED',
    description: 'One-time deposit',
    failure_reason: 'Insufficient funds at processing time',
    encrypted_payload: null,
    created_at: '2025-04-05T09:10:00.000Z',
    updated_at: '2025-04-05T09:10:30.000Z',
  },
];

const transactions: PayIn[] = MOCK_TRANSACTIONS.map(dto =>
  PayInMapper.toDomain(dto),
);

type Props = BottomTabScreenProps<BottomTabsParams, 'Home'>;

export const HomeScreen = ({ navigation }: Props): JSX.Element => {
  return (
    <StandardWrapper>
      <View style={styles.scroll}>
        <BalanceCard
          onTopUp={() => {}}
          onSend={() => {
            navigation.navigate('PayIn');
          }}
        />

        <SummaryRow />

        <ActiveGoalsCard savingsCount={2} onPress={() => {}} />

        <RecentActivity
          transactions={transactions}
          onSeeAll={() => {}}
          onTransactionPress={() => {}}
        />
      </View>

      <PayInSnackbar visible onView={() => {}} />
    </StandardWrapper>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: widthFullScreen * 0.28,
  },
});
