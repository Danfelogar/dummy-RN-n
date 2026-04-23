// TransactionRecord is the persisted snapshot of a PayIn
// that gets written to the local SQLite cache.
// It is intentionally a flat value-object (no class methods)
// so it can be trivially serialised to/from SQL rows.

import { PayinStatus, PaymentMethod } from './payIn';

export interface TransactionRecord {
  readonly id: string;
  readonly idempotency_key: string;
  readonly customer_id: string;
  readonly amount: number;
  readonly currency: string;
  readonly payment_method: PaymentMethod;
  readonly status: PayinStatus;
  readonly description: string;
  readonly failure_reason: string | null;
  readonly encrypted_payload: string | null;
  readonly created_at: string; // ISO
  readonly updated_at: string; // ISO
  /** Epoch ms — used to ORDER BY when reading the cache */
  readonly cached_at: number;
}
