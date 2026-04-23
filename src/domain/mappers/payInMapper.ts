//   PayinDTO        ↔  PayIn   (API ↔ domain)
//   TransactionRecord ↔ PayIn  (SQLite cache ↔ domain)

import { PayIn } from '../entities';
import { Amount } from '../value-objects/amount';
import { PayinDTO } from '../value-objects/payInDTO';
import { TransactionRecord } from '../entities/transactionRecord';

export class PayInMapper {
  //API DTO → Domain
  static toDomain(dto: PayinDTO): PayIn {
    return new PayIn(
      dto.id,
      dto.idempotency_key,
      dto.customer_id,
      new Amount(dto.amount),
      dto.currency,
      dto.payment_method,
      dto.status,
      dto.description,
      dto.failure_reason,
      dto.encrypted_payload,
      new Date(dto.created_at),
      new Date(dto.updated_at),
    );
  }
  //Domain → API DTO
  static toDTO(entity: PayIn): PayinDTO {
    return {
      id: entity['id'],
      idempotency_key: entity['idempotencyKey'],
      customer_id: entity['customerId'],
      amount: entity.getAmount(),
      currency: entity['currency'],
      payment_method: entity['paymentMethod'],
      status: entity['status'],
      description: entity['description'],
      failure_reason: entity['failureReason'],
      encrypted_payload: entity['encryptedPayload'],
      created_at: entity['createdAt'].toISOString(),
      updated_at: entity['updatedAt'].toISOString(),
    };
  }
  //SQLite TransactionRecord → Domain
  static recordToDomain(record: TransactionRecord): PayIn {
    return new PayIn(
      record.id,
      record.idempotency_key,
      record.customer_id,
      new Amount(record.amount),
      record.currency,
      record.payment_method,
      record.status,
      record.description,
      record.failure_reason,
      record.encrypted_payload,
      new Date(record.created_at),
      new Date(record.updated_at),
    );
  }
  //Domain → SQLite TransactionRecord
  static domainToRecord(entity: PayIn): TransactionRecord {
    return {
      id: entity['id'],
      idempotency_key: entity['idempotencyKey'],
      customer_id: entity['customerId'],
      amount: entity.getAmount(),
      currency: entity['currency'],
      payment_method: entity['paymentMethod'],
      status: entity['status'],
      description: entity['description'],
      failure_reason: entity['failureReason'],
      encrypted_payload: entity['encryptedPayload'],
      created_at: entity['createdAt'].toISOString(),
      updated_at: entity['updatedAt'].toISOString(),
      cached_at: Date.now(),
    };
  }
}
