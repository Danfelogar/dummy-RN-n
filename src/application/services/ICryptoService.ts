export interface ICryptoService {
  generateRsaKeyPair(): Promise<{
    publicKeyPem: string;
    privateKeyPem: string;
  }>;
  computeFingerprint(publicKeyPem: string): Promise<string>;
  encryptPrivateKey(privateKeyPem: string): Promise<string>;
  decryptPrivateKey(encryptedPrivateKey: string): Promise<string>;
  rsaDecryptPayload(
    ciphertextBase64: string,
    encryptedPrivateKey: string,
  ): Promise<string>;
  encryptPayload(data: unknown): Promise<string>;
}
