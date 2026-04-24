import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvAdapter } from '../mmkvStorage';
import {
  OfflineQueueState,
  OfflineQueueWithoutActions,
  QueuedPayInItem,
} from './interfaces';

const INITIAL_STATE: OfflineQueueWithoutActions = {
  queue: null,
  isProcessing: false,
};

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      enqueue: (item: QueuedPayInItem) => {
        const { queue, isProcessing } = get();
        if (isProcessing) {
          console.warn(
            '⚠️ OfflineQueue: cannot enqueue while processing is in progress',
          );
          return;
        }
        if (queue !== null) {
          console.warn(
            'OfflineQueue: a pending item already exists — ignoring new enqueue',
          );
          return;
        }
        set({ queue: item });
        console.log(`PayIn enqueued (idempotencyKey: ${item.idempotencyKey})`);
      },

      dequeue: () => {
        set({ queue: null, isProcessing: false });
        console.log('OfflineQueue: item dequeued after successful retry');
      },

      hasPending: () => get().queue !== null,

      setProcessing: (value: boolean) => set({ isProcessing: value }),

      cleanAllQueueState: () => {
        set({ ...INITIAL_STATE });
        console.log('OfflineQueue: state reset');
      },
    }),
    {
      name: 'offline-queue-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: state => ({
        queue: state.queue,
      }),
    },
  ),
);
