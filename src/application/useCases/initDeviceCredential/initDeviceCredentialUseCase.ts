import { DeviceCredential, KeyPairVO } from '../../../domain';
import { IDeviceCredentialRepository } from '../../repositories';
import { ICryptoService } from '../../services';

export interface InitDeviceCredentialResult {
  credential: DeviceCredential;
  alreadyExisted: boolean;
}

export class InitDeviceCredentialUseCase {
  constructor(
    private readonly credentialRepo: IDeviceCredentialRepository,
    private readonly cryptoService: ICryptoService,
  ) {}

  async execute(): Promise<InitDeviceCredentialResult> {
    const existing = await this.credentialRepo.find();
    if (existing?.isInitialized) {
      return { credential: existing, alreadyExisted: true };
    }

    const { publicKeyPem, privateKeyPem } =
      await this.cryptoService.generateRsaKeyPair();

    const fingerprint = await this.cryptoService.computeFingerprint(
      publicKeyPem,
    );

    const encryptedPrivateKey = await this.cryptoService.encryptPrivateKey(
      privateKeyPem,
    );

    const keyPair: KeyPairVO = {
      publicKeyPem,
      privateKeyPem: encryptedPrivateKey,
      generatedAt: new Date().toISOString(),
      fingerprint,
    };

    const credential: DeviceCredential = {
      id: await this.cryptoService.generateUuid(),
      keyPair,
      isInitialized: true,
    };

    await this.credentialRepo.save(credential);

    return { credential, alreadyExisted: false };
  }
}
