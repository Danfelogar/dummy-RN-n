import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvAdapter } from '../mmkvStorage';
import { OfflineQueueState, OfflineQueueWithoutActions } from './interfaces';
import { PayIn, PayInMapper } from '../../../../domain';

const INITIAL_STATE: OfflineQueueWithoutActions = {
  queue: null,
  isLoading: false,
};

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addToQueue: (payIn: PayIn) => {
        const { queue, isLoading } = get();
        if (isLoading || queue !== null) {
          console.warn(
            '⚠️ The queue already contains items or is currently processing them',
          );
          return;
        }

        set({ isLoading: true });

        try {
          const payInDTO = PayInMapper.toDTO(payIn);
          console.log('📥 PayIn added to the offline queue:', payInDTO.id);

          set({ queue: payInDTO });
        } catch (error) {
          console.error('❌ Error adding PayIn to the queue:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      hasPending: () => {
        const { queue } = get();
        return queue !== null;
      },

      cleanAllQueueState: () => {
        set({ ...INITIAL_STATE });
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
