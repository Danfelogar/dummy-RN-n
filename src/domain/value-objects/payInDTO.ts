import { PayinStatus, PaymentMethod } from '../entities';

export interface PayinDTO {
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
