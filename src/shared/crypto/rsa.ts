/**
 * RsaLab — RSA-OAEP Asymmetric Crypto Utility
 *
 * Uses react-native-quick-crypto (native C++/JSI) as engine.
 *
 * RSA-OAEP (Optimal Asymmetric Encryption Padding) provides:
 *  - Public-key encryption  → backend encrypts payloads with the device's public key
 *  - Private-key decryption → only the device can decrypt those payloads
 *  - Key fingerprint        → SHA-256 of the DER-encoded public key (hex)
 *
 * Key format: PEM (base64-encoded DER wrapped in -----BEGIN/END-----)
 * Key size:   2048 bits (safe default; 4096 available if needed)
 */
import { Buffer } from 'buffer';

import QuickCrypto from 'react-native-quick-crypto';

export interface RsaKeyPair {
  publicKeyPem: string; // PEM — share with backend
  privateKeyPem: string; // PEM — keep on device (encrypt at rest with AES-GCM)
  generatedAt: string; // ISO timestamp
}

export interface RsaEncryptResult {
  ciphertext: string; // base64-encoded encrypted bytes
  algorithm: 'RSA-OAEP-SHA256';
  encryptedAt: string;
}
/**
 * Generates a 2048-bit RSA key pair.
 * Returns both keys as PEM strings.
 */
export function generateRsaKeyPair(): RsaKeyPair {
  const { publicKey, privateKey } = QuickCrypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return {
    publicKeyPem: publicKey as string,
    privateKeyPem: privateKey as string,
    generatedAt: new Date().toISOString(),
  };
}

//Fingerprint
/**
 * Computes SHA-256 fingerprint of a PEM public key.
 * Strips the PEM header/footer, decodes base64, hashes the DER bytes.
 *
 * @returns lowercase hex string (64 chars)
 */
export function computeFingerprint(publicKeyPem: string): string {
  // Strip PEM envelope and whitespace to get raw base64
  const base64 = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '');

  const derBytes = Buffer.from(base64, 'base64');
  const hash = QuickCrypto.createHash('sha256');
  hash.update(derBytes);
  return (hash.digest('hex') as unknown as Buffer).toString('hex');
}

//Encrypt (backend → device)
/**
 * Encrypts plaintext with a RSA public key (OAEP + SHA-256).
 * The backend uses this to send encrypted payloads to the device.
 *
 * @param plaintext    UTF-8 string to encrypt
 * @param publicKeyPem PEM public key from the device
 */
export function rsaEncrypt(
  plaintext: string,
  publicKeyPem: string,
): RsaEncryptResult {
  const ciphertextBuffer = QuickCrypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: QuickCrypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(plaintext, 'utf8'),
  );

  return {
    ciphertext: (ciphertextBuffer as unknown as Buffer).toString('base64'),
    algorithm: 'RSA-OAEP-SHA256',
    encryptedAt: new Date().toISOString(),
  };
}

//Decrypt (device only)

/**
 * Decrypts an RSA-OAEP ciphertext with the device's private key.
 * Only the device that generated the key pair can call this successfully.
 *
 * @param ciphertextBase64 base64-encoded encrypted bytes
 * @param privateKeyPem    PEM private key (already decrypted from AES-GCM at-rest)
 */
export function rsaDecrypt(
  ciphertextBase64: string,
  privateKeyPem: string,
): string {
  const plaintextBuffer = QuickCrypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: QuickCrypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(ciphertextBase64, 'base64'),
  );

  return (plaintextBuffer as unknown as Buffer).toString('utf8');
}

//Helpers
export function summarizePem(pem: string, fingerprint: string): string {
  const short = fingerprint.slice(0, 8) + '…' + fingerprint.slice(-8);
  const type = pem.includes('PUBLIC') ? 'RSA-PUB' : 'RSA-PRIV';
  return `${type}:${short}`;
}
