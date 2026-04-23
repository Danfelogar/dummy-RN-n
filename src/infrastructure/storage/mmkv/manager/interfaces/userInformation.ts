export interface UserInformationState {
  //state
  name: string;
  email: string;
  accountNumber: string;
  availableBalance: number;
  spent: number;
  monthIncome: number;
  //Actions
  setAvailableBalance: (balance: number) => void;
  cleanState: () => void;
}

export interface UserInformationWithoutActions
  extends Omit<UserInformationState, 'setAvailableBalance' | 'cleanState'> {}
