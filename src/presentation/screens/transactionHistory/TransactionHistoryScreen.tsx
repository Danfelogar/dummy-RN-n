import { useCallback } from 'react';
import { FlatList, StyleSheet, View, ListRenderItemInfo } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { TRANSACTION_HISTORY_STRINGS } from './transactionhistory.strings';
import { useTransactionHistory } from '../../hooks';
import { PayIn } from '../../../domain';
import {
  colors,
  heightFullScreen,
  InputGeneric,
  StandardWrapper,
  TransactionItem,
  widthFullScreen,
} from '../../../shared';

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text variant="titleMedium" style={styles.emptyTitle}>
      {TRANSACTION_HISTORY_STRINGS.EMPTY_TITLE}
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      {TRANSACTION_HISTORY_STRINGS.EMPTY_SUBTITLE}
    </Text>
  </View>
);

const ItemSeparator = () => <View style={styles.separator} />;

export const TransactionHistoryScreen = () => {
  const { form, filteredTransactions, searchValue, clearSearch } =
    useTransactionHistory();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<PayIn>) => (
      <TransactionItem
        item={item}
        customKey={index}
        onPress={txn => {
          // Navigate to TransactionDetailsScreen — wire up navigation here
          console.log('Selected transaction:', txn.getId());
        }}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: PayIn) => item.getId(), []);

  return (
    <StandardWrapper>
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

      <Surface style={styles.listCard} elevation={1}>
        <FlatList<PayIn>
          data={filteredTransactions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={[
            styles.listContent,
            filteredTransactions.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </Surface>
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
