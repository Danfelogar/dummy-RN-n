import { UserInformation } from '../../domain';

export interface IUserInformationRepository {
  getAllUserInformation(): Promise<UserInformation>;
  setAvailableBalance(balance: number): Promise<void>;
  cleanState(): Promise<void>;
}
