import { URL_BASE_FOR_FRONTEND, URL_BASE_FOR_FRONTEND_ANDROID } from '@env';
import { AxiosInstance } from 'axios';

import { InitDeviceCredentialUseCase } from '../../../application';
import { isIOS } from '../../../shared';
import { DeviceCredentialRepository } from '../../storage';
import { createClient } from '../createClient';
import { applyAuthInterceptor } from '../interceptors/auth.interceptor';
import { CryptoService } from '../services';

export function createTumiPayClient(onAuthError?: () => void): AxiosInstance {
  const instance = createClient(
    isIOS() ? URL_BASE_FOR_FRONTEND : URL_BASE_FOR_FRONTEND_ANDROID,
    {
      serviceName: 'TumiPay',
      onAuthError,
    },
  );
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
