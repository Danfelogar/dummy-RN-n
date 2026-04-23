import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvAdapter } from '../mmkvStorage';
import {
  UserInformationState,
  UserInformationWithoutActions,
} from './interfaces';

export const INIT_USER_INFORMATION_STATE: UserInformationWithoutActions = {
  userDetails: {
    name: 'John Doe',
    email: '****oe@example.com',
    account_number: '****789',
    available_balance: 99.5,
    spent: 1120,
    month_income: 4230,
  },
};

export const userInformationStorage = create<UserInformationState>()(
  persist(
    (set, get) => ({
      ...INIT_USER_INFORMATION_STATE,

      setAvailableBalance: (balance: number) =>
        set(state => ({
          userDetails: {
            ...state.userDetails,
            available_balance: balance,
          },
        })),

      getAllUserInformation: () => {
        const { userDetails } = get();
        return userDetails;
      },

      cleanState: () => set(() => ({ ...INIT_USER_INFORMATION_STATE })),
    }),
    {
      name: 'user-information-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: state => ({
        userDetails: state.userDetails,
      }),
    },
  ),
);
