import { InitDeviceCredentialUseCase } from '../initDeviceCredentialUseCase';

jest.mock('../../../../shared', () => ({
  generateUuid: jest.fn(),
}));

jest.mock('../../../../domain', () => ({
  // Domain types are interfaces/value-objects
}));

import { generateUuid } from '../../../../shared';

// Fixtures
const MOCK_UUID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

const MOCK_KEY_PAIR = {
  publicKeyPem: 'mock-public-key',
  privateKeyPem: 'mock-private-key',
};

const MOCK_FINGERPRINT = 'mock-fingerprint-abc123';
const MOCK_ENCRYPTED_PRIVATE_KEY = 'mock-encrypted-private-key';

const MOCK_EXISTING_CREDENTIAL = {
  id: 'existing-id-001',
  keyPair: {
    publicKeyPem: 'existing-public-key',
    privateKeyPem: 'existing-encrypted-key',
    generatedAt: '2026-01-01T00:00:00.000Z',
    fingerprint: 'existing-fingerprint',
  },
  isInitialized: true,
};

// Helpers
const buildMocks = () => {
  const credentialRepo = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const cryptoService = {
    generateRsaKeyPair: jest.fn(),
    computeFingerprint: jest.fn(),
    encryptPrivateKey: jest.fn(),
  };

  const useCase = new InitDeviceCredentialUseCase(
    credentialRepo as any,
    cryptoService as any,
  );

  return { useCase, credentialRepo, cryptoService };
};

describe('InitDeviceCredentialUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateUuid as jest.Mock).mockResolvedValue(MOCK_UUID);
  });

  describe('when a valid credential already exists', () => {
    it('should return the existing credential without creating a new one', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(MOCK_EXISTING_CREDENTIAL);

      const result = await useCase.execute();

      expect(result.credential).toEqual(MOCK_EXISTING_CREDENTIAL);
    });

    it('should return alreadyExisted as true', async () => {
      const { useCase, credentialRepo } = buildMocks();
      credentialRepo.find.mockResolvedValue(MOCK_EXISTING_CREDENTIAL);

      const result = await useCase.execute();

      expect(result.alreadyExisted).toBe(true);
    });

    it('should not call cryptoService at all', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(MOCK_EXISTING_CREDENTIAL);

      await useCase.execute();

      expect(cryptoService.generateRsaKeyPair).not.toHaveBeenCalled();
      expect(cryptoService.computeFingerprint).not.toHaveBeenCalled();
      expect(cryptoService.encryptPrivateKey).not.toHaveBeenCalled();
    });

    it('should not call credentialRepo.save', async () => {
      const { useCase, credentialRepo } = buildMocks();
      credentialRepo.find.mockResolvedValue(MOCK_EXISTING_CREDENTIAL);

      await useCase.execute();

      expect(credentialRepo.save).not.toHaveBeenCalled();
    });

    it('should not call generateUuid', async () => {
      const { useCase, credentialRepo } = buildMocks();
      credentialRepo.find.mockResolvedValue(MOCK_EXISTING_CREDENTIAL);

      await useCase.execute();

      expect(generateUuid).not.toHaveBeenCalled();
    });
  });

  describe('when no credential exists', () => {
    beforeEach(() => {
      // null simulates an empty repository
    });

    it('should generate a new RSA key pair', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      await useCase.execute();

      expect(cryptoService.generateRsaKeyPair).toHaveBeenCalledTimes(1);
    });

    it('should compute the fingerprint from the public key', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      await useCase.execute();

      expect(cryptoService.computeFingerprint).toHaveBeenCalledWith(
        MOCK_KEY_PAIR.publicKeyPem,
      );
    });

    it('should encrypt the private key', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      await useCase.execute();

      expect(cryptoService.encryptPrivateKey).toHaveBeenCalledWith(
        MOCK_KEY_PAIR.privateKeyPem,
      );
    });

    it('should save the new credential with the encrypted private key — never the raw one', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      await useCase.execute();

      const savedCredential = credentialRepo.save.mock.calls[0][0];
      expect(savedCredential.keyPair.privateKeyPem).toBe(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );
      expect(savedCredential.keyPair.privateKeyPem).not.toBe(
        MOCK_KEY_PAIR.privateKeyPem,
      );
    });

    it('should save the credential with isInitialized set to true', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      await useCase.execute();

      const savedCredential = credentialRepo.save.mock.calls[0][0];
      expect(savedCredential.isInitialized).toBe(true);
    });

    it('should save the credential with the UUID from generateUuid', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      await useCase.execute();

      const savedCredential = credentialRepo.save.mock.calls[0][0];
      expect(savedCredential.id).toBe(MOCK_UUID);
    });

    it('should save the credential with the correct fingerprint', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      await useCase.execute();

      const savedCredential = credentialRepo.save.mock.calls[0][0];
      expect(savedCredential.keyPair.fingerprint).toBe(MOCK_FINGERPRINT);
    });

    it('should return alreadyExisted as false', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      const result = await useCase.execute();

      expect(result.alreadyExisted).toBe(false);
    });

    it('should return the newly created credential in the result', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      const result = await useCase.execute();

      expect(result.credential.id).toBe(MOCK_UUID);
      expect(result.credential.isInitialized).toBe(true);
      expect(result.credential.keyPair.fingerprint).toBe(MOCK_FINGERPRINT);
    });
  });

  describe('when credential exists but is not initialized', () => {
    it('should treat it as non-existent and create a new one', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();

      credentialRepo.find.mockResolvedValue({
        ...MOCK_EXISTING_CREDENTIAL,
        isInitialized: false,
      });
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      const result = await useCase.execute();

      expect(result.alreadyExisted).toBe(false);
      expect(credentialRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('when credentialRepo.find returns undefined', () => {
    it('should treat undefined the same as null and create a new credential', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();

      credentialRepo.find.mockResolvedValue(undefined);
      cryptoService.generateRsaKeyPair.mockResolvedValue(MOCK_KEY_PAIR);
      cryptoService.computeFingerprint.mockResolvedValue(MOCK_FINGERPRINT);
      cryptoService.encryptPrivateKey.mockResolvedValue(
        MOCK_ENCRYPTED_PRIVATE_KEY,
      );

      const result = await useCase.execute();

      expect(result.alreadyExisted).toBe(false);
      expect(credentialRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('operation order guarantee', () => {
    it('should generate keys before computing fingerprint and encrypting', async () => {
      const { useCase, credentialRepo, cryptoService } = buildMocks();
      credentialRepo.find.mockResolvedValue(null);

      const order: string[] = [];

      cryptoService.generateRsaKeyPair.mockImplementation(async () => {
        order.push('generateRsaKeyPair');
        return MOCK_KEY_PAIR;
      });
      cryptoService.computeFingerprint.mockImplementation(async () => {
        order.push('computeFingerprint');
        return MOCK_FINGERPRINT;
      });
      cryptoService.encryptPrivateKey.mockImplementation(async () => {
        order.push('encryptPrivateKey');
        return MOCK_ENCRYPTED_PRIVATE_KEY;
      });
      credentialRepo.save.mockImplementation(async () => {
        order.push('save');
      });

      await useCase.execute();

      expect(order).toEqual([
        'generateRsaKeyPair',
        'computeFingerprint',
        'encryptPrivateKey',
        'save',
      ]);
    });
  });
});
