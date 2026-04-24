// Business rule:
//   When the device comes back online, if the offline queue holds a pending
//   PayIn that was never sent (no matching idempotency_key on the backend),
//   this use-case retries the creation and then flushes the queue.
//
// Idempotency guarantee:
//   The original idempotency key that was generated client-side is preserved
//   so a duplicate cannot be created even if the request was partially sent.

import { CreatePayInDTO, PayIn, PayInMapper } from '../../../domain';
import {
  IPayInRepository,
  ITransactionCacheRepository,
  IUserInformationRepository,
} from '../../repositories';
export interface QueuedPayIn {
  /** The original idempotency key — must be preserved for retry */
  idempotencyKey: string;
  dto: CreatePayInDTO;
}

export interface ProcessOfflineQueueResult {
  processed: boolean;
  payIn?: PayIn;
  error?: string;
}

export class ProcessOfflineQueueUseCase {
  constructor(
    private readonly payInRepo: IPayInRepository,
    private readonly cacheRepo: ITransactionCacheRepository,
    private readonly userInfoRepo: IUserInformationRepository,
  ) {}

  async execute(
    queued: QueuedPayIn | null,
    dequeue: () => void,
  ): Promise<ProcessOfflineQueueResult> {
    if (!queued) {
      return { processed: false };
    }

    try {
      // Retry with the SAME idempotency key — backend will deduplicate
      const payIn = await this.payInRepo.create(
        queued.dto,
        queued.idempotencyKey,
      );
      // Persist into local SQLite cache
      await this.cacheRepo.upsertMany([PayInMapper.domainToRecord(payIn)]);
      // Deduct from the available balance stored locally
      const { available_balance } =
        await this.userInfoRepo.getAllUserInformation();
      const newBalance = available_balance - queued.dto.amount;
      await this.userInfoRepo.setAvailableBalance(newBalance);
      // Flush the queue — must happen AFTER the API call succeeds
      dequeue();

      return { processed: true, payIn };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown error during queue flush';
      return { processed: false, error: message };
    }
  }
}
