// Responsibility:
//   • Subscribe to connectivity changes via useInternetStatus.
//   • When the device comes back online AND a pending queue item exists,
//     fire ProcessOfflineQueueUseCase.
//   • Show toast notifications so the user is always informed:
//       - "Processing your pending payment…"  (while retrying)
//       - "Payment sent successfully!"         (on success)
//       - "Could not send your payment"        (on failure)

import { useEffect, useRef } from 'react';

import { QueuedPayIn } from '../../application';
import { container, useOfflineQueueStore } from '../../infrastructure';
import { showToast, useInternetStatus } from '../../shared';

export function useOfflineQueueProcessor(): void {
  const { isConnected, isInternetReachable } = useInternetStatus();
  const isOnline = isConnected && isInternetReachable;
  const { hasPending, queue, dequeue, setProcessing, isProcessing } =
    useOfflineQueueStore();
  const runningRef = useRef(false);

  useEffect(() => {
    // Only fire when we come back online with a pending item
    if (!isOnline || !hasPending() || isProcessing || runningRef.current) {
      return;
    }

    const pendingItem = queue;
    if (!pendingItem) return;

    runningRef.current = true;
    setProcessing(true);

    showToast({
      type: 'info',
      title: 'Processing pending payment',
      body: "You're back online — sending your queued payment…",
    });

    const queuedPayIn: QueuedPayIn = {
      idempotencyKey: pendingItem.idempotencyKey,
      dto: pendingItem.dto,
    };

    container.processOfflineQueue
      .execute(
        queuedPayIn,
        dequeue,
        // deductBalance is handled inside the use-case; pass a no-op here because UserInformationRepository is already wired in the container.
        async () => {},
      )
      .then(result => {
        if (result.processed) {
          showToast({
            type: 'success',
            title: 'Payment sent!',
            body: `Transaction ${result.payIn?.getId()} completed successfully.`,
          });
        } else {
          showToast({
            type: 'error',
            title: 'Payment failed',
            body: result.error ?? 'Please try again from the PayIn screen.',
          });
          setProcessing(false);
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        showToast({
          type: 'error',
          title: 'Payment error',
          body: message,
        });
        setProcessing(false);
      })
      .finally(() => {
        runningRef.current = false;
      });
     
  }, [isOnline]);
}
