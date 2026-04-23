import { PaymentMethod } from '../entities';

export interface CreatePayInDTO {
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  description?: string;
  encrypted_payload?: string;
}
