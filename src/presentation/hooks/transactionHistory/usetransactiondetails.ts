import { useState, useEffect } from 'react';

import { PayIn, PayinDTO, PayInMapper } from '../../../domain';
import { container } from '../../../infrastructure';
import { showToast, useInternetStatus } from '../../../shared';

export interface UseTransactionDetailsResult {
  transaction: PayIn | null;
  isFound: boolean;
  dto: PayinDTO | null;
  isLoading: boolean;
  fromCache: boolean;
}

export const useTransactionDetails = (
  id: string,
): UseTransactionDetailsResult => {
  const { isConnected, isInternetReachable } = useInternetStatus();
  const isOnline = isConnected && isInternetReachable;

  const [transaction, setTransaction] = useState<PayIn | null>(null);
  const [dto, setDto] = useState<PayinDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      setIsLoading(true);

      try {
        const { payIn, fromCache: usedCache } =
          await container.getPayIn.execute(id);

        if (cancelled) return;

        if (payIn) {
          setTransaction(payIn);
          setDto(PayInMapper.toDTO(payIn));
          setFromCache(usedCache);

          if (usedCache) {
            showToast({
              type: 'warning',
              title: 'Showing cached data',
              body: 'You are offline — displaying last synced details.',
            });
          }
        } else {
          setTransaction(null);
          setDto(null);
          setFromCache(false);
          showToast({
            type: 'error',
            title: 'Transaction not found',
            body: 'This transaction could not be found online or in your local cache.',
          });
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setTransaction(null);
        setDto(null);
        showToast({
          type: 'error',
          title: 'Failed to load transaction',
          body:
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred.',
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [id, isOnline]);

  return {
    transaction,
    isFound: transaction !== null,
    dto,
    isLoading,
    fromCache,
  };
};
