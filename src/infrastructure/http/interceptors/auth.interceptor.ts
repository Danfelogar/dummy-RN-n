import { AxiosInstance } from 'axios';
import { summarizePem } from '../../../shared/crypto/rsa';
import { InitDeviceCredentialUseCase } from '../../../application';

export const applyAuthInterceptor = (
  instance: AxiosInstance,
  initCredentialUseCase: InitDeviceCredentialUseCase,
): void => {
  instance.interceptors.request.use(
    async config => {
      const op =
        (config.headers?.['x-operation-name'] as string | undefined) ??
        'UnknownOperation';

      try {
        const { credential, alreadyExisted } =
          await initCredentialUseCase.execute();

        if (!alreadyExisted) {
          console.log(
            '🔑 New device credential generated:',
            summarizePem(
              credential.keyPair.publicKeyPem,
              credential.keyPair.fingerprint,
            ),
          );
        }

        config.headers['X-Public-Key'] = credential.keyPair.publicKeyPem;
        config.headers['X-Public-Key-Fingerprint'] =
          credential.keyPair.fingerprint;

        console.log(
          `🔐 Auth headers attached in ${op} — fingerprint: ${credential.keyPair.fingerprint.slice(
            0,
            12,
          )}…`,
        );
      } catch (error) {
        console.error(
          `❌ Auth interceptor failed to attach public key in ${op}:`,
          error,
        );
      }

      return config;
    },
    error => Promise.reject(error),
  );
};
