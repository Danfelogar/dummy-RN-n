// Orchestrates the full PayIn creation flow:
//   1. Generate a fresh idempotency key.
//   2. POST to the backend via IPayInRepository.
//   3. Write the result to the local SQLite cache (ITransactionCacheRepository).
//   4. Deduct (amount) from the user's available_balance via IUserInformationRepository.

import { CreatePayInDTO, PayIn, PayInMapper } from '../../../domain';
import { generateUuid } from '../../../shared';
import {
  IPayInRepository,
  ITransactionCacheRepository,
  IUserInformationRepository,
} from '../../repositories';
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
    private readonly cacheRepo: ITransactionCacheRepository,
    private readonly userInfoRepo: IUserInformationRepository,
  ) {}

  async execute(input: CreatePayInInput): Promise<CreatePayInResult> {
    const idempotencyKey = await generateUuid();

    const dto: CreatePayInDTO = {
      customer_id: input.customer_id,
      amount: input.amount,
      payment_method: input.payment_method,
      description: input.description,
    };

    const payIn = await this.payInRepo.create(dto, idempotencyKey);
    //Write-through cache
    await this.cacheRepo.upsertMany([PayInMapper.domainToRecord(payIn)]);
    //Deduct balance locally
    const userInfo = await this.userInfoRepo.getAllUserInformation();
    const newBalance = userInfo.available_balance - input.amount;
    await this.userInfoRepo.setAvailableBalance(newBalance);

    return { payIn, idempotencyKey, idempotentHit: false };
  }
}
