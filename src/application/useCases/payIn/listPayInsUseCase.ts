import { PayIn } from '../../../domain';
import { IPayInRepository, ListPayInsParams } from '../../repositories';

export class ListPayInsUseCase {
  constructor(private readonly payInRepo: IPayInRepository) {}

  async execute(params?: ListPayInsParams): Promise<PayIn[]> {
    return this.payInRepo.findAll(params);
  }
}
