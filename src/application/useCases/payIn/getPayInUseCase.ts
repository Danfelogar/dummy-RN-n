import { PayIn, PayInMapper } from '../../../domain';
import {
  IPayInRepository,
  ITransactionCacheRepository,
} from '../../repositories';

export interface GetPayInResult {
  payIn: PayIn | null;
  fromCache: boolean;
}

export class GetPayInUseCase {
  constructor(
    private readonly payInRepo: IPayInRepository,
    private readonly cacheRepo: ITransactionCacheRepository,
  ) {}

  async execute(id: string): Promise<GetPayInResult> {
    try {
      const payIn = await this.payInRepo.findById(id);
      if (payIn) {
        await this.cacheRepo.upsertMany([PayInMapper.domainToRecord(payIn)]);
        return { payIn, fromCache: false };
      }
    } catch (_) {}

    const record = await this.cacheRepo.findById(id);
    if (!record) return { payIn: null, fromCache: true };

    return {
      payIn: PayInMapper.recordToDomain(record),
      fromCache: true,
    };
  }
}
