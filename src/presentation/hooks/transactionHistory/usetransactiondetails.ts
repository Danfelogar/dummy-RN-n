import { useMemo } from 'react';
import {
  PayIn,
  PayinDTO,
  PayInMapper,
  PayinStatus,
  PaymentMethod,
} from '../../../domain';

const MOCK_TRANSACTIONS: PayinDTO[] = [
  {
    id: 'txn_001a2b3c',
    idempotency_key: 'idem_seed_001',
    customer_id: 'cust_john_doe',
    amount: 150.0,
    currency: 'USD',
    payment_method: 'CARD' as PaymentMethod,
    status: 'PROCESSED' as PayinStatus,
    description: 'Subscription renewal - Pro plan',
    failure_reason: null,
    encrypted_payload: null,
    created_at: '2025-04-01T10:23:00.000Z',
    updated_at: '2025-04-01T10:23:45.000Z',
  },
  {
    id: 'txn_002d4e5f',
    idempotency_key: 'idem_seed_002',
    customer_id: 'cust_jane_smith',
    amount: 320.5,
    currency: 'USD',
    payment_method: 'BANK_TRANSFER' as PaymentMethod,
    status: 'PROCESSED' as PayinStatus,
    description: 'Invoice payment INV-2025-042',
    failure_reason: null,
    encrypted_payload: null,
    created_at: '2025-04-03T14:05:00.000Z',
    updated_at: '2025-04-03T14:05:52.000Z',
  },
  {
    id: 'txn_003g6h7i',
    idempotency_key: 'idem_seed_003',
    customer_id: 'cust_carlos_m',
    amount: 75.99,
    currency: 'USD',
    payment_method: 'CASH' as PaymentMethod,
    status: 'FAILED' as PayinStatus,
    description: 'One-time deposit',
    failure_reason: 'Insufficient funds at processing time',
    encrypted_payload: null,
    created_at: '2025-04-05T09:10:00.000Z',
    updated_at: '2025-04-05T09:10:30.000Z',
  },
  {
    id: 'txn_004j8k9l',
    idempotency_key: 'idem_seed_004',
    customer_id: 'cust_maria_g',
    amount: 1240.0,
    currency: 'USD',
    payment_method: 'CARD' as PaymentMethod,
    status: 'VALIDATED' as PayinStatus,
    description: 'Enterprise license purchase',
    failure_reason: null,
    encrypted_payload: null,
    created_at: '2025-04-06T16:45:00.000Z',
    updated_at: '2025-04-06T16:45:30.000Z',
  },
  {
    id: 'txn_005m0n1o',
    idempotency_key: 'idem_seed_005',
    customer_id: 'cust_peter_k',
    amount: 2100.0,
    currency: 'USD',
    payment_method: 'BANK_TRANSFER' as PaymentMethod,
    status: 'CREATED' as PayinStatus,
    description: 'Wire transfer - Batch Q2',
    failure_reason: null,
    encrypted_payload: null,
    created_at: '2025-04-07T08:00:00.000Z',
    updated_at: '2025-04-07T08:00:15.000Z',
  },
];

export interface UseTransactionDetailsResult {
  transaction: PayIn | null;
  isFound: boolean;
  dto: PayinDTO | null;
}

export const useTransactionDetails = (
  id: string,
): UseTransactionDetailsResult => {
  const dto = useMemo<PayinDTO | null>(
    () => MOCK_TRANSACTIONS.find(t => t.id === id) ?? null,
    [id],
  );

  const transaction = useMemo<PayIn | null>(
    () => (dto ? PayInMapper.toDomain(dto) : null),
    [dto],
  );

  return {
    transaction,
    isFound: transaction !== null,
    dto,
  };
};
