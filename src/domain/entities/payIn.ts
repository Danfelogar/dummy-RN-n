import { Amount } from '../value-objects';

export type PayinStatus = 'PROCESSED' | 'FAILED' | 'VALIDATED' | 'CREATED';
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH';

export class PayIn {
  constructor(
    private readonly id: string,
    private idempotencyKey: string,
    private customerId: string,
    private amount: Amount,
    private currency: string,
    private paymentMethod: PaymentMethod,
    private status: PayinStatus,
    private description: string,
    private failureReason: string | null,
    private encryptedPayload: string | null,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  getId() {
    return this.id;
  }

  getStatus() {
    return this.status;
  }

  getDescription() {
    return this.description;
  }

  getPaymentMethod() {
    return this.paymentMethod;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  validate() {
    this.status = 'VALIDATED';
  }

  markAsProcessed() {
    if (this.status !== 'VALIDATED') {
      throw new Error('PayIn must be validated before processing');
    }
    this.status = 'PROCESSED';
  }

  markAsFailed(reason: string) {
    this.status = 'FAILED';
    this.failureReason = reason;
  }

  getAmount(): number {
    return this.amount.getValue();
  }
}
