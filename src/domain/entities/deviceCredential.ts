import { KeyPairVO } from '../value-objects';

export interface DeviceCredential {
  readonly id: string; // UUID
  readonly keyPair: KeyPairVO;
  readonly isInitialized: boolean;
}
