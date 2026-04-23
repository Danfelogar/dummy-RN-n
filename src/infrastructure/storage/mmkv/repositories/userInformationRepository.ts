import { IUserInformationRepository } from '../../../../application';
import { UserInformation } from '../../../../domain';
import { userInformationStorage } from '../manager';

export class UserInformationRepository implements IUserInformationRepository {
  async getAllUserInformation(): Promise<UserInformation> {
    return userInformationStorage.getState().getAllUserInformation();
  }

  async setAvailableBalance(balance: number) {
    return userInformationStorage.getState().setAvailableBalance(balance);
  }

  async cleanState() {
    return userInformationStorage.getState().cleanState();
  }
}
