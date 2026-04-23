import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvAdapter } from '../mmkvStorage';
import { DeviceCredential } from '../../../../domain/entities/deviceCredential';
import { IDeviceCredentialRepository } from '../../../../application/repositories/IDeviceCredentialRepository';
import {
  DeviceCredentialState,
  DeviceCredentialWithoutActions,
} from './interfaces';

const INITIAL_STATE: DeviceCredentialWithoutActions = {
  credential: null,
  isLoading: false,
};

export const useDeviceCredentialStore = create<DeviceCredentialState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      saveCredential: async (credential: DeviceCredential) => {
        const { isLoading } = get();
        if (isLoading) {
          console.warn('⚠️ DeviceCredential store is busy');
          return;
        }

        set({ isLoading: true });
        try {
          set({ credential });
          console.log('🔐 DeviceCredential persisted. ID:', credential.id);
        } catch (error) {
          console.error('❌ Error saving DeviceCredential:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      getCredential: () => get().credential,

      clearCredential: async () => {
        set({ ...INITIAL_STATE });
        console.log('🗑️ DeviceCredential cleared from store');
      },
    }),
    {
      name: 'device-credential-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: state => ({
        credential: state.credential,
      }),
    },
  ),
);
