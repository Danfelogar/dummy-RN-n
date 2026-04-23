export interface KeyPairVO {
  readonly publicKeyPem: string; // PEM base64
  readonly privateKeyPem: string; // PEM base64
  readonly generatedAt: string; // ISO timestamp
  readonly fingerprint: string; // SHA-256 of publicKey
}
