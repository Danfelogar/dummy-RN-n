export type PayinStatus = 'PROCESSED' | 'FAILED' | 'VALIDATED' | 'CREATED';
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH';

export interface Payin {
  id: string;
  idempotency_key: string;
  customer_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PayinStatus;
  description: string;
  failure_reason: string | null;
  encrypted_payload: string | null;
  created_at: string;
  updated_at: string;
}
