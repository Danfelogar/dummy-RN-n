import { IDeviceCredentialRepository } from '../../../../application';
import { DeviceCredential } from '../../../../domain';
import { useDeviceCredentialStore } from '../manager';

export class DeviceCredentialRepository implements IDeviceCredentialRepository {
  async find(): Promise<DeviceCredential | null> {
    return useDeviceCredentialStore.getState().getCredential();
  }

  async save(credential: DeviceCredential): Promise<void> {
    await useDeviceCredentialStore.getState().saveCredential(credential);
  }

  async clear(): Promise<void> {
    await useDeviceCredentialStore.getState().clearCredential();
  }
}
