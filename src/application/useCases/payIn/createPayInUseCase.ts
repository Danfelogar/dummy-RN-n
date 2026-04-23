import { CreatePayInDTO, PayIn } from '../../../domain';
import { IPayInRepository } from '../../repositories';
import { ICryptoService } from '../../services';

export interface CreatePayInInput {
  customer_id: string;
  amount: number;
  payment_method: 'CARD' | 'BANK_TRANSFER' | 'CASH';
  description?: string;
}

export interface CreatePayInResult {
  payIn: PayIn;
  idempotencyKey: string;
  idempotentHit: boolean;
}

export class CreatePayInUseCase {
  constructor(
    private readonly payInRepo: IPayInRepository,
    private readonly cryptoService: ICryptoService,
  ) {}

  async execute(input: CreatePayInInput): Promise<CreatePayInResult> {
    const idempotencyKey = await this.cryptoService.generateUuid();

    const dto: CreatePayInDTO = {
      customer_id: input.customer_id,
      amount: input.amount,
      payment_method: input.payment_method,
      description: input.description,
    };

    const payIn = await this.payInRepo.create(dto, idempotencyKey);

    return { payIn, idempotencyKey, idempotentHit: false };
  }
}
