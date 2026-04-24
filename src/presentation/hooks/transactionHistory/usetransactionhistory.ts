// Data strategy (decided by ListTransactionsUseCase):
//   Online  → fetch from API → write-through to SQLite → display
//   Offline → read SQLite cache → display with an offline badge
//
// The hook shows a toast whenever:
//   • It falls back to the cache (user should know data may be stale).
//   • The API call itself throws (network timeout, 5xx, etc.).
//
// Search filtering happens in-memory on the already-fetched list so
// the user can instantly filter without extra round-trips.

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { PayIn } from '../../../domain';
import { container } from '../../../infrastructure';
import { showToast, useInternetStatus } from '../../../shared';

export interface TransactionHistoryFormValues {
  search: string;
}

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export const useTransactionHistory = () => {
  const { isConnected, isInternetReachable } = useInternetStatus();
  const isOnline = isConnected && isInternetReachable;

  const [allTransactions, setAllTransactions] = useState<PayIn[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [fromCache, setFromCache] = useState(false);

  const form = useForm<TransactionHistoryFormValues>({
    defaultValues: { search: '' },
  });

  const searchValue = form.watch('search');

  const fetchTransactions = useCallback(async () => {
    setLoadState('loading');

    try {
      const { transactions, fromCache: usedCache } =
        await container.listTransactions.execute({ isConnected: isOnline });

      setAllTransactions(transactions);
      setFromCache(usedCache);
      setLoadState('success');

      if (usedCache) {
        showToast({
          type: 'warning',
          title: 'Showing cached data',
          body: "You're offline — displaying your last synced transactions.",
        });
      }
    } catch (err: unknown) {
      setLoadState('error');

      const message =
        err instanceof Error
          ? err.message
          : 'Could not load transactions. Please try again.';

      showToast({
        type: 'error',
        title: 'Failed to load transactions',
        body: message,
      });
    }
  }, [isOnline]);

  // Initial load + re-fetch when connectivity changes (offline → online)
  useEffect(() => {
    fetchTransactions();
     
  }, [isOnline]);

  //Client-side search filter
  const filteredTransactions = useMemo<PayIn[]>(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return allTransactions;

    return allTransactions.filter(txn => {
      const idMatch = txn.getId().toLowerCase().includes(query);
      const descMatch = txn.getDescription().toLowerCase().includes(query);
      return idMatch || descMatch;
    });
  }, [searchValue, allTransactions]);

  const clearSearch = () => form.setValue('search', '');

  return {
    form,
    filteredTransactions,
    searchValue,
    clearSearch,
    loadState,
    fromCache,
    isOnline,
    refetch: fetchTransactions,
  };
};
