import { CreatePayInDTO } from '../../domain';
import { PayIn, PayinStatus } from '../../domain/entities/payIn';

export interface ListPayInsParams {
  status?: PayinStatus;
  customer_id?: string;
}

export interface IPayInRepository {
  create(dto: CreatePayInDTO, idempotencyKey: string): Promise<PayIn>;
  findAll(params?: ListPayInsParams): Promise<PayIn[]>;
  findById(id: string): Promise<PayIn | null>;
}
