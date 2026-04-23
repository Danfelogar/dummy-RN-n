import { DeviceCredential } from '../../../../../domain';

export interface DeviceCredentialState {
  //state
  credential: DeviceCredential | null;
  //loading state
  isLoading: boolean;
  // actions
  saveCredential: (credential: DeviceCredential) => Promise<void>;
  getCredential: () => DeviceCredential | null;
  clearCredential: () => Promise<void>;
}

export interface DeviceCredentialWithoutActions
  extends Omit<
    DeviceCredentialState,
    'saveCredential' | 'getCredential' | 'clearCredential'
  > {}
