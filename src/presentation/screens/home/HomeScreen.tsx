import { JSX } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  colors,
  EmptyState,
  ErrorState,
  heightFullScreen,
  OfflineBanner,
  StandardWrapper,
  useInternetStatus,
  widthFullScreen,
} from '../../../shared';
import {
  ActiveGoalsCard,
  BalanceCard,
  PayInSnackbar,
  RecentActivity,
  SummaryRow,
} from '../../components';
import { BottomTabsParams } from '../../navigation';
import { useTransactionHistory } from '../../hooks';
import { TRANSACTION_HISTORY_STRINGS } from '../transactionHistory';
import { Text } from 'react-native-paper';

type Props = BottomTabScreenProps<BottomTabsParams, 'Home'>;

export const HomeScreen = ({ navigation }: Props): JSX.Element => {
  const { loadState, refetch, filteredTransactions } = useTransactionHistory();
  const { isConnected, isInternetReachable } = useInternetStatus();

  const isLoading = loadState === 'loading';
  const isError = loadState === 'error';
  const isOnline = isConnected && isInternetReachable;
  return (
    <StandardWrapper>
      <View style={styles.scroll}>
        {/* Offline banner */}
        {!isOnline && <OfflineBanner onRefresh={refetch} />}
        <BalanceCard
          onTopUp={() => {}}
          onSend={() => {
            navigation.navigate('PayIn');
          }}
        />
        <SummaryRow />

        <ActiveGoalsCard savingsCount={2} onPress={() => {}} />

        {isLoading && filteredTransactions.length === 0 ? (
          <View style={styles.centeredLoader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              {TRANSACTION_HISTORY_STRINGS.LOAD_DATA}
            </Text>
          </View>
        ) : isError && filteredTransactions.length === 0 ? (
          <ErrorState onRetry={refetch} />
        ) : filteredTransactions.length > 0 ? (
          <RecentActivity
            transactions={filteredTransactions.slice(0, 3)}
            onSeeAll={() => {
              navigation.navigate('TransactionHistory');
            }}
          />
        ) : (
          <EmptyState />
        )}
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
  centeredLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: heightFullScreen * 0.1,
  },
  loadingText: {
    color: colors.onSurfaceVariant,
  },
});
