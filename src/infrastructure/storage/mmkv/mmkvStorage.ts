import { MMKV_ENCRYPTION_KEY } from '@env';
import { createMMKV } from 'react-native-mmkv';

const mmkvStorage = createMMKV({
  id: 'countries-cache',
  encryptionKey: MMKV_ENCRYPTION_KEY,
});

export const mmkvAdapter = {
  getItem: (name: string) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name: string) => {
    mmkvStorage.remove(name);
  },
};
