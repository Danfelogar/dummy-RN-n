import { AxiosInstance } from 'axios';
import { InitDeviceCredentialUseCase } from '../../../application';
import { DeviceCredentialRepository } from '../../storage/mmkv/repositories/deviceCredentialRepository';
import { createClient } from '../createClient';
import { applyAuthInterceptor } from '../interceptors/auth.interceptor';
import { CryptoService } from '../services';
import { URL_BASE_FOR_FRONTEND } from '@env';

export function createTumiPayClient(onAuthError?: () => void): AxiosInstance {
  const instance = createClient(URL_BASE_FOR_FRONTEND, {
    serviceName: 'TumiPay',
    onAuthError,
  });
  //infrastructure dependencies
  const credentialRepo = new DeviceCredentialRepository();
  const cryptoService = new CryptoService();
  const initCredentialUseCase = new InitDeviceCredentialUseCase(
    credentialRepo,
    cryptoService,
  );

  applyAuthInterceptor(instance, initCredentialUseCase);

  return instance;
}

// Singleton
export const tumiPayClient: AxiosInstance = createTumiPayClient();
