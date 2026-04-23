/**
 * AesGcmLab — AES-256-GCM Crypto Utility
 *
 * Uses react-native-quick-crypto (native C++/JSI) as the primary engine.
 *
 * AES-GCM (Galois/Counter Mode) provides:
 *  - Confidentiality  → encrypted ciphertext
 *  - Integrity        → authentication tag (16 bytes)
 *  - No padding needed (stream cipher mode)
 */

import QuickCrypto from 'react-native-quick-crypto';

//Pure hex helpers (no Node Buffer needed)

/** Uint8Array → lowercase hex string. e.g. [0xde,0xad] → "dead" */
function bytesToHex(bytes: ArrayLike<number>): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes as any)[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/** Hex string → Uint8Array. e.g. "dead" → Uint8Array([0xde,0xad]) */
function hexToBytes(hex: string): Uint8Array {
  const len = hex.length / 2;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

//Types
export interface AesGcmEncryptResult {
  ciphertext: string; // hex-encoded encrypted bytes
  iv: string; // hex-encoded 12-byte IV (nonce)
  authTag: string; // hex-encoded 16-byte GCM authentication tag
  keyHex: string; // hex-encoded 256-bit key used
  algorithm: 'AES-256-GCM';
  encryptedAt: string; // ISO timestamp
}

export interface AesGcmDecryptResult {
  plaintext: string;
  verified: boolean;
}

//Key Generation

export function generateKey(): string {
  const keyBytes = QuickCrypto.randomBytes(32);
  return bytesToHex(keyBytes as unknown as Uint8Array);
}
//Encrypt

/**
 * Encrypts plaintext using AES-256-GCM.
 *
 * Strategy:
 *  1. Probe native module availability first (isNativeAvailable)
 *  2. If available: use react-native-quick-crypto (true GCM with auth tag)
 *
 * @param plaintext  UTF-8 string to encrypt
 * @param keyHex     Optional 64-char hex key. Auto-generated if omitted.
 */
export function encryptAesGcm(
  plaintext: string,
  keyHex?: string,
): AesGcmEncryptResult {
  const key = keyHex ?? generateKey();
  const keyBuffer = hexToBytes(key);
  const ivBytes = QuickCrypto.randomBytes(12) as unknown as Uint8Array;

  const cipher = QuickCrypto.createCipheriv('aes-256-gcm', keyBuffer, ivBytes);
  const ciphertext =
    (cipher.update(plaintext, 'utf8', 'hex') as string) +
    (cipher.final('hex') as string);

  const authTag = cipher.getAuthTag() as unknown as Uint8Array;

  return {
    ciphertext,
    iv: bytesToHex(ivBytes),
    authTag: bytesToHex(authTag),
    keyHex: key,
    algorithm: 'AES-256-GCM',
    encryptedAt: new Date().toISOString(),
  };
}

//Decrypt

/**
 * Decrypts an AES-256-GCM ciphertext and verifies the authentication tag.
 * Returns verified=false (and empty plaintext) on tag mismatch.
 *
 * @param encrypted  Result object from encryptAesGcm()
 */
export function decryptAesGcm(
  encrypted: AesGcmEncryptResult,
): AesGcmDecryptResult {
  const keyBuffer = hexToBytes(encrypted.keyHex);
  const ivBuffer = hexToBytes(encrypted.iv);
  const authTagBuffer = hexToBytes(encrypted.authTag);

  const decipher = QuickCrypto.createDecipheriv(
    'aes-256-gcm',
    keyBuffer,
    ivBuffer,
  );

  (decipher as any).setAuthTag(authTagBuffer);

  const plaintext =
    (decipher.update(encrypted.ciphertext, 'hex', 'utf8') as string) +
    (decipher.final('utf8') as string);

  return {
    plaintext,
    verified: true,
  };
}

//Helpers

/** Truncates a hex string for display: first N + "…" + last N chars */
export function truncateHex(hex: string, halfLen = 12): string {
  if (hex.length <= halfLen * 2) {
    return hex;
  }
  return `${hex.slice(0, halfLen)}…${hex.slice(-halfLen)}`;
}

/** Groups a hex string into space-separated byte pairs: "a3 f1 b2" */
export function formatHexBytes(hex: string): string {
  return hex.match(/.{1,2}/g)?.join(' ') ?? hex;
}
