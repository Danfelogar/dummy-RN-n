import { TransactionRecord } from '../../domain';

export interface ITransactionCacheRepository {
  /** Persist one or many records (upsert by id). */
  upsertMany(records: TransactionRecord[]): Promise<void>;
  /** Return all cached records ordered by cached_at DESC. */
  findAll(): Promise<TransactionRecord[]>;
  /** Return a single record by PayIn id, or null if absent. */
  findById(id: string): Promise<TransactionRecord | null>;
  /** Replace the whole cache (used after a successful API sync). */
  replaceAll(records: TransactionRecord[]): Promise<void>;
  /** Total number of rows in the cache. */
  count(): Promise<number>;
  /** Drop all rows (call on logout / credential reset). */
  clear(): Promise<void>;
}
