// Concrete implementation of ITransactionCacheRepository backed by
// All SQL is parameterised — no string interpolation of user data.
// The repository is intentionally stateless; every method opens the
// connection via `getDb()` which returns a singleton.

import { ITransactionCacheRepository } from '../../../../application';
import { TransactionRecord } from '../../../../domain';
import { getDb } from '../nitroSQLiteDb';

// Helper — map a raw SQL row to a TransactionRecord
function rowToRecord(row: Record<string, unknown>): TransactionRecord {
  return {
    id: row.id as string,
    idempotency_key: row.idempotency_key as string,
    customer_id: row.customer_id as string,
    amount: row.amount as number,
    currency: row.currency as string,
    payment_method: row.payment_method as TransactionRecord['payment_method'],
    status: row.status as TransactionRecord['status'],
    description: (row.description as string) ?? '',
    failure_reason: (row.failure_reason as string | null) ?? null,
    encrypted_payload: (row.encrypted_payload as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    cached_at: row.cached_at as number,
  };
}

export class TransactionCacheRepository implements ITransactionCacheRepository {
  //Upsert
  async upsertMany(records: TransactionRecord[]): Promise<void> {
    if (records.length === 0) return;

    const db = getDb();

    for (const r of records) {
      db.execute(
        `INSERT INTO transactions (
          id, idempotency_key, customer_id, amount, currency,
          payment_method, status, description, failure_reason,
          encrypted_payload, created_at, updated_at, cached_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status            = excluded.status,
          failure_reason    = excluded.failure_reason,
          updated_at        = excluded.updated_at,
          cached_at         = excluded.cached_at;`,
        [
          r.id,
          r.idempotency_key,
          r.customer_id,
          r.amount,
          r.currency,
          r.payment_method,
          r.status,
          r.description,
          r.failure_reason,
          r.encrypted_payload,
          r.created_at,
          r.updated_at,
          r.cached_at,
        ],
      );
    }
  }
  //Find all
  async findAll(): Promise<TransactionRecord[]> {
    const db = getDb();
    const result = db.execute(
      'SELECT * FROM transactions ORDER BY cached_at DESC;',
    );
    const rows: Record<string, unknown>[] = result.rows?._array ?? [];
    return rows.map(rowToRecord);
  }
  //Find by id
  async findById(id: string): Promise<TransactionRecord | null> {
    const db = getDb();
    const result = db.execute(
      'SELECT * FROM transactions WHERE id = ? LIMIT 1;',
      [id],
    );
    const rows: Record<string, unknown>[] = result.rows?._array ?? [];
    if (rows.length === 0) return null;
    return rowToRecord(rows[0]);
  }
  //Replace all
  async replaceAll(records: TransactionRecord[]): Promise<void> {
    const db = getDb();
    db.execute('DELETE FROM transactions;');
    await this.upsertMany(records);
  }
  //Count
  async count(): Promise<number> {
    const db = getDb();
    const result = db.execute('SELECT COUNT(*) as total FROM transactions;');
    const rows: Record<string, unknown>[] = result.rows?._array ?? [];
    return (rows[0]?.total as number) ?? 0;
  }
  //Clear
  async clear(): Promise<void> {
    const db = getDb();
    db.execute('DELETE FROM transactions;');
  }
}
