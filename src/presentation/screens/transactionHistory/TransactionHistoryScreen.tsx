import {
  FlatList,
  StyleSheet,
  View,
  ListRenderItemInfo,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useCallback } from 'react';
import { Text, Surface } from 'react-native-paper';

import { TRANSACTION_HISTORY_STRINGS } from './transactionhistory.strings';
import { PayIn } from '../../../domain';
import {
  colors,
  EmptyState,
  ErrorState,
  heightFullScreen,
  InputGeneric,
  OfflineBanner,
  StandardWrapper,
  TransactionItem,
  widthFullScreen,
} from '../../../shared';
import { useTransactionHistory } from '../../hooks';

const ItemSeparator = () => <View style={styles.separator} />;

export const TransactionHistoryScreen = () => {
  const {
    form,
    filteredTransactions,
    searchValue,
    clearSearch,
    loadState,
    fromCache,
    refetch,
  } = useTransactionHistory();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<PayIn>) => (
      <TransactionItem
        item={item}
        customKey={index}
        onPress={txn => {
          console.log('Selected transaction:', txn.getId());
        }}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: PayIn) => item.getId(), []);

  const isLoading = loadState === 'loading';
  const isError = loadState === 'error';

  return (
    <StandardWrapper>
      {/* Offline banner */}
      {fromCache && <OfflineBanner onRefresh={refetch} />}

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <InputGeneric
            control={form.control}
            name={TRANSACTION_HISTORY_STRINGS.SEARCH_FIELD_NAME}
            label={TRANSACTION_HISTORY_STRINGS.SEARCH_LABEL}
            placeholder={TRANSACTION_HISTORY_STRINGS.SEARCH_PLACEHOLDER}
            keyboardType="default"
            leftIcon="magnify"
            activeOutlineColor={colors.primary}
            outlineColor={colors.outline}
            rightIcon={searchValue.length > 0 ? 'close-circle' : undefined}
            onRightIconPress={clearSearch}
          />
        </View>
      </View>

      {/* Loading spinner (first load only) */}
      {isLoading && filteredTransactions.length === 0 && (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            {TRANSACTION_HISTORY_STRINGS.LOAD_DATA}
          </Text>
        </View>
      )}

      {/* Error state */}
      {isError && filteredTransactions.length === 0 && (
        <ErrorState onRetry={refetch} />
      )}

      {/* List */}
      {!isLoading || filteredTransactions.length > 0 ? (
        <Surface style={styles.listCard} elevation={1}>
          <FlatList<PayIn>
            data={filteredTransactions}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
            ListEmptyComponent={isLoading ? null : <EmptyState />}
            contentContainerStyle={[
              styles.listContent,
              filteredTransactions.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl
                refreshing={isLoading && filteredTransactions.length > 0}
                onRefresh={refetch}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        </Surface>
      ) : null}
      <View
        style={{ width: widthFullScreen, height: heightFullScreen * 0.05 }}
      />
    </StandardWrapper>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    paddingHorizontal: widthFullScreen * 0.04,
    paddingTop: widthFullScreen * 0.04,
    paddingBottom: widthFullScreen * 0.03,
  },
  searchInputWrapper: {
    width: '100%',
  },
  listCard: {
    width: 'auto',
    marginHorizontal: widthFullScreen * 0.04,
    marginBottom: widthFullScreen * 0.04,
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    flex: 1,
  },
  listContent: {
    paddingHorizontal: widthFullScreen * 0.04,
    paddingVertical: widthFullScreen * 0.02,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginLeft: widthFullScreen * 0.155,
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
