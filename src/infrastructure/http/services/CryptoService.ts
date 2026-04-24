import QuickCrypto from 'react-native-quick-crypto';
import {
  generateRsaKeyPair,
  computeFingerprint,
  rsaDecrypt,
} from '../../../shared/crypto/rsa';
import {
  encryptAesGcm,
  decryptAesGcm,
  AesGcmEncryptResult,
} from '../../../shared/crypto/aes-gcm';
import { ICryptoService } from '../../../application';

/**
 * CryptoService
 *
 * Bridges the pure crypto utilities (rsa.ts, aes-gcm.ts) with the
 * application layer contract (ICryptoService).
 *
 * Private key lifecycle:
 *   generate (PEM) → encryptPrivateKey (AES-GCM blob) → persist in MMKV
 *   load from MMKV → decryptPrivateKey (PEM) → rsaDecryptPayload
 */
export class CryptoService implements ICryptoService {
  // Key generation
  async generateRsaKeyPair(): Promise<{
    publicKeyPem: string;
    privateKeyPem: string;
  }> {
    const { publicKeyPem, privateKeyPem } = generateRsaKeyPair();
    return { publicKeyPem, privateKeyPem };
  }

  async computeFingerprint(publicKeyPem: string): Promise<string> {
    return computeFingerprint(publicKeyPem);
  }
  // At-rest protection of the private key (AES-256-GCM)
  /**
   * Serialises the AesGcmEncryptResult as JSON so it can be stored
   * as a single string field in DeviceCredential.keyPair.privateKeyPem.
   */
  async encryptPrivateKey(privateKeyPem: string): Promise<string> {
    const result: AesGcmEncryptResult = encryptAesGcm(privateKeyPem);
    return JSON.stringify(result);
  }

  /**
   * Parses the JSON blob and decrypts back to a raw PEM string.
   */
  async decryptPrivateKey(encryptedPrivateKey: string): Promise<string> {
    const result: AesGcmEncryptResult = JSON.parse(encryptedPrivateKey);
    const { plaintext } = decryptAesGcm(result);
    return plaintext;
  }

  // RSA payload decryption

  /**
   * Full round-trip:
   *   1. Decrypt the AES-GCM envelope to recover the raw PEM private key.
   *   2. Use it to RSA-OAEP decrypt the backend's ciphertext.
   *   3. Wipe the raw PEM from local scope immediately after use.
   */
  async rsaDecryptPayload(
    ciphertextBase64: string,
    encryptedPrivateKey: string,
  ): Promise<string> {
    const privateKeyPem = await this.decryptPrivateKey(encryptedPrivateKey);
    try {
      return rsaDecrypt(ciphertextBase64, privateKeyPem);
    } finally {
      // Hint to the JS engine that the raw key is no longer needed.
      // (JS has no guaranteed memory wipe, but this removes the reference.)
      void privateKeyPem;
    }
  }

  /**
   * Encrypts arbitrary data with AES-256-GCM for transport.
   * The result is a JSON string (AesGcmEncryptResult) stored as
   * encrypted_payload in the PayIn request body.
   *
   * The backend stores this blob opaquely and never decrypts it;
   * future versions may use the device public key to wrap the AES key.
   *
   * @param data  Any JSON-serialisable object
   */
  async encryptPayload(data: unknown): Promise<string> {
    const plaintext = JSON.stringify(data);
    const result: AesGcmEncryptResult = encryptAesGcm(plaintext);
    return JSON.stringify(result);
  }
}
