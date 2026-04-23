import { PayIn, PayinDTO } from '../../../../../domain';

export interface OfflineQueueState {
  // state
  queue: PayinDTO | null;
  // Loading states
  isLoading: boolean;
  // Actions
  addToQueue: (payIn: PayIn) => void;
  hasPending: () => boolean;
  cleanAllQueueState: () => void;
}

export interface OfflineQueueWithoutActions
  extends Omit<
    OfflineQueueState,
    'addToQueue' | 'hasPending' | 'cleanAllQueueState'
  > {}
