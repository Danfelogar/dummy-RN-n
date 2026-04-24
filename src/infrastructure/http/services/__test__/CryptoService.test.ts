import { CryptoService } from '../CryptoService';
// Mocks
jest.mock('../../../../shared/crypto/rsa', () => ({
  generateRsaKeyPair: jest.fn(),
  computeFingerprint: jest.fn(),
  rsaDecrypt: jest.fn(),
}));

jest.mock('../../../../shared/crypto/aes-gcm', () => ({
  encryptAesGcm: jest.fn(),
  decryptAesGcm: jest.fn(),
}));

import {
  generateRsaKeyPair,
  computeFingerprint,
  rsaDecrypt,
} from '../../../../shared/crypto/rsa';

import {
  encryptAesGcm,
  decryptAesGcm,
} from '../../../../shared/crypto/aes-gcm';

// Fixtures
const MOCK_PUBLIC_KEY = 'mock-public-key-pem';
const MOCK_PRIVATE_KEY = 'mock-private-key-pem';
const MOCK_FINGERPRINT = 'aa:bb:cc:dd:ee:ff';
const MOCK_CIPHERTEXT_BASE64 = 'bW9ja2NpcGhlcnRleHQ=';
const MOCK_DECRYPTED_PAYLOAD = 'decrypted-plaintext';

const MOCK_AES_RESULT = {
  ciphertext: 'mock-ciphertext',
  iv: 'mock-iv',
  tag: 'mock-tag',
};

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CryptoService();
  });

  describe('generateRsaKeyPair', () => {
    it('should delegate to the rsa utility and return the key pair', async () => {
      (generateRsaKeyPair as jest.Mock).mockReturnValue({
        publicKeyPem: MOCK_PUBLIC_KEY,
        privateKeyPem: MOCK_PRIVATE_KEY,
      });

      const result = await service.generateRsaKeyPair();

      expect(generateRsaKeyPair).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        publicKeyPem: MOCK_PUBLIC_KEY,
        privateKeyPem: MOCK_PRIVATE_KEY,
      });
    });
  });

  describe('computeFingerprint', () => {
    it('should pass the public key to the rsa utility', async () => {
      (computeFingerprint as jest.Mock).mockReturnValue(MOCK_FINGERPRINT);

      await service.computeFingerprint(MOCK_PUBLIC_KEY);

      expect(computeFingerprint).toHaveBeenCalledWith(MOCK_PUBLIC_KEY);
    });

    it('should return the fingerprint produced by the rsa utility', async () => {
      (computeFingerprint as jest.Mock).mockReturnValue(MOCK_FINGERPRINT);

      const result = await service.computeFingerprint(MOCK_PUBLIC_KEY);

      expect(result).toBe(MOCK_FINGERPRINT);
    });
  });

  describe('encryptPrivateKey', () => {
    it('should pass the raw private key PEM to encryptAesGcm', async () => {
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);

      await service.encryptPrivateKey(MOCK_PRIVATE_KEY);

      expect(encryptAesGcm).toHaveBeenCalledWith(MOCK_PRIVATE_KEY);
    });

    it('should return the AES-GCM result serialised as a JSON string', async () => {
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);

      const result = await service.encryptPrivateKey(MOCK_PRIVATE_KEY);

      expect(result).toBe(JSON.stringify(MOCK_AES_RESULT));
    });

    it('should produce a string that is valid JSON', async () => {
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);

      const result = await service.encryptPrivateKey(MOCK_PRIVATE_KEY);

      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('decryptPrivateKey', () => {
    it('should parse the JSON blob and pass the result to decryptAesGcm', async () => {
      (decryptAesGcm as jest.Mock).mockReturnValue({
        plaintext: MOCK_PRIVATE_KEY,
      });

      await service.decryptPrivateKey(JSON.stringify(MOCK_AES_RESULT));

      expect(decryptAesGcm).toHaveBeenCalledWith(MOCK_AES_RESULT);
    });

    it('should return the plaintext from decryptAesGcm', async () => {
      (decryptAesGcm as jest.Mock).mockReturnValue({
        plaintext: MOCK_PRIVATE_KEY,
      });

      const result = await service.decryptPrivateKey(
        JSON.stringify(MOCK_AES_RESULT),
      );

      expect(result).toBe(MOCK_PRIVATE_KEY);
    });

    it('should be the exact inverse of encryptPrivateKey', async () => {
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);
      (decryptAesGcm as jest.Mock).mockReturnValue({
        plaintext: MOCK_PRIVATE_KEY,
      });

      const encrypted = await service.encryptPrivateKey(MOCK_PRIVATE_KEY);
      const decrypted = await service.decryptPrivateKey(encrypted);

      expect(decrypted).toBe(MOCK_PRIVATE_KEY);
    });
  });

  describe('rsaDecryptPayload', () => {
    it('should decrypt the private key before calling rsaDecrypt', async () => {
      (decryptAesGcm as jest.Mock).mockReturnValue({
        plaintext: MOCK_PRIVATE_KEY,
      });
      (rsaDecrypt as jest.Mock).mockReturnValue(MOCK_DECRYPTED_PAYLOAD);

      await service.rsaDecryptPayload(
        MOCK_CIPHERTEXT_BASE64,
        JSON.stringify(MOCK_AES_RESULT),
      );

      expect(decryptAesGcm).toHaveBeenCalledTimes(1);
    });

    it('should call rsaDecrypt with the ciphertext and the recovered plain PEM', async () => {
      (decryptAesGcm as jest.Mock).mockReturnValue({
        plaintext: MOCK_PRIVATE_KEY,
      });
      (rsaDecrypt as jest.Mock).mockReturnValue(MOCK_DECRYPTED_PAYLOAD);

      await service.rsaDecryptPayload(
        MOCK_CIPHERTEXT_BASE64,
        JSON.stringify(MOCK_AES_RESULT),
      );

      expect(rsaDecrypt).toHaveBeenCalledWith(
        MOCK_CIPHERTEXT_BASE64,
        MOCK_PRIVATE_KEY,
      );
    });

    it('should return the plaintext produced by rsaDecrypt', async () => {
      (decryptAesGcm as jest.Mock).mockReturnValue({
        plaintext: MOCK_PRIVATE_KEY,
      });
      (rsaDecrypt as jest.Mock).mockReturnValue(MOCK_DECRYPTED_PAYLOAD);

      const result = await service.rsaDecryptPayload(
        MOCK_CIPHERTEXT_BASE64,
        JSON.stringify(MOCK_AES_RESULT),
      );

      expect(result).toBe(MOCK_DECRYPTED_PAYLOAD);
    });

    it('should propagate errors thrown by rsaDecrypt', async () => {
      (decryptAesGcm as jest.Mock).mockReturnValue({
        plaintext: MOCK_PRIVATE_KEY,
      });
      (rsaDecrypt as jest.Mock).mockImplementation(() => {
        throw new Error('RSA decryption failed');
      });

      await expect(
        service.rsaDecryptPayload(
          MOCK_CIPHERTEXT_BASE64,
          JSON.stringify(MOCK_AES_RESULT),
        ),
      ).rejects.toThrow('RSA decryption failed');
    });
  });

  describe('encryptPayload', () => {
    it('should serialise the input data to JSON before encrypting', async () => {
      const data = { amount: 100, currency: 'USD' };
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);

      await service.encryptPayload(data);

      expect(encryptAesGcm).toHaveBeenCalledWith(JSON.stringify(data));
    });

    it('should return the AES-GCM result serialised as a JSON string', async () => {
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);

      const result = await service.encryptPayload({ foo: 'bar' });

      expect(result).toBe(JSON.stringify(MOCK_AES_RESULT));
    });

    it('should handle primitive values as input', async () => {
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);

      const result = await service.encryptPayload('plain string');

      expect(encryptAesGcm).toHaveBeenCalledWith(
        JSON.stringify('plain string'),
      );
      expect(result).toBe(JSON.stringify(MOCK_AES_RESULT));
    });

    it('should produce a string that is valid JSON', async () => {
      (encryptAesGcm as jest.Mock).mockReturnValue(MOCK_AES_RESULT);

      const result = await service.encryptPayload({ test: true });

      expect(() => JSON.parse(result)).not.toThrow();
    });
  });
});
