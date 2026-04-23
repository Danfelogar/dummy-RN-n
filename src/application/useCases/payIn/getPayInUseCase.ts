import { PayIn } from '../../../domain';
import { IPayInRepository } from '../../repositories';

export class GetPayInUseCase {
  constructor(private readonly payInRepo: IPayInRepository) {}

  async execute(id: string): Promise<PayIn | null> {
    return this.payInRepo.findById(id);
  }
}
