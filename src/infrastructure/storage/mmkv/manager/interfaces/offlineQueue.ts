import { CreatePayInDTO, PayIn } from '../../../../../domain';

export interface QueuedPayInItem {
  /** Preserved from the original attempt so the retry is idempotent */
  idempotencyKey: string;
  dto: CreatePayInDTO;
  /** Epoch ms of when the item was enqueued */
  enqueuedAt: number;
}
export interface OfflineQueueState {
  // state
  queue: QueuedPayInItem | null;
  // Loading states
  isProcessing: boolean;
  // Actions
  enqueue(item: QueuedPayInItem): void;
  dequeue(): void;
  hasPending(): boolean;
  setProcessing(value: boolean): void;
  cleanAllQueueState(): void;
}

export interface OfflineQueueWithoutActions
  extends Omit<
    OfflineQueueState,
    | 'enqueue'
    | 'dequeue'
    | 'hasPending'
    | 'setProcessing'
    | 'cleanAllQueueState'
  > {}
