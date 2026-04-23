import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvAdapter } from '../mmkvStorage';
import {
  UserInformationState,
  UserInformationWithoutActions,
} from './interfaces';

export const INIT_USER_INFORMATION_STATE: UserInformationWithoutActions = {
  name: 'John Doe',
  email: '****oe@example.com',
  accountNumber: '****789',
  availableBalance: 99.5,
  spent: 1120,
  monthIncome: 4230,
};

export const userInformationStorage = create<UserInformationState>()(
  persist(
    (set, get) => ({
      ...INIT_USER_INFORMATION_STATE,

      setAvailableBalance: (balance: number) =>
        set(state => ({ ...state, availableBalance: balance })),

      cleanState: () => set(() => ({ ...INIT_USER_INFORMATION_STATE })),
    }),
    {
      name: 'user-information-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: state => ({
        name: state.name,
        email: state.email,
        accountNumber: state.accountNumber,
        availableBalance: state.availableBalance,
        spent: state.spent,
        monthIncome: state.monthIncome,
      }),
    },
  ),
);
