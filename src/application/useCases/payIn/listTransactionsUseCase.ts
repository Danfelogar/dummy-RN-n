// Business rule:
//   • Online  → fetch from API, upsert results in the local cache, return them.
//   • Offline → return the local SQLite cache (stale-while-revalidate pattern).
//
// This use-case is the ONLY place where the "online vs offline" decision
// lives.  Presentation and infrastructure layers never make that call.

import { PayIn, PayInMapper, TransactionRecord } from '../../../domain';
import {
  IPayInRepository,
  ITransactionCacheRepository,
  ListPayInsParams,
} from '../../repositories';

export interface ListTransactionsResult {
  transactions: PayIn[];
  fromCache: boolean;
}

export class ListTransactionsUseCase {
  constructor(
    private readonly payInRepo: IPayInRepository,
    private readonly cacheRepo: ITransactionCacheRepository,
  ) {}

  async execute(
    params: ListPayInsParams & { isConnected: boolean },
  ): Promise<ListTransactionsResult> {
    const { isConnected, ...queryParams } = params;

    //Offline path
    if (!isConnected) {
      const records = await this.cacheRepo.findAll();
      return {
        transactions: records.map(r => PayInMapper.recordToDomain(r)),
        fromCache: true,
      };
    }

    //Online path
    try {
      const payIns = await this.payInRepo.findAll(queryParams);
      //purge data before upsert to avoid keeping stale records that are no longer present in the API response. This can happen if a transaction is deleted or updated to a different status and is no longer returned by the API.
      await this.cacheRepo.clear();
      // Sync to local cache so next offline session has fresh data
      const records: TransactionRecord[] = payIns.map(p =>
        PayInMapper.domainToRecord(p),
      );
      await this.cacheRepo.upsertMany(records);

      return { transactions: payIns, fromCache: false };
    } catch {
      // Network call failed despite being "connected" — fall back to cache
      const records = await this.cacheRepo.findAll();
      return {
        transactions: records.map(r => PayInMapper.recordToDomain(r)),
        fromCache: true,
      };
    }
  }
}
