import { UserInformation } from '../../../../../domain';

export interface UserInformationState {
  //state
  userDetails: UserInformation;
  //Actions
  getAllUserInformation: () => UserInformation;
  setAvailableBalance: (balance: number) => void;
  cleanState: () => void;
}

export interface UserInformationWithoutActions
  extends Omit<
    UserInformationState,
    'setAvailableBalance' | 'cleanState' | 'getAllUserInformation'
  > {}
