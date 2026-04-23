import { DeviceCredential } from '../../domain';

export interface IDeviceCredentialRepository {
  find(): Promise<DeviceCredential | null>;
  save(credential: DeviceCredential): Promise<void>;
  clear(): Promise<void>;
}
