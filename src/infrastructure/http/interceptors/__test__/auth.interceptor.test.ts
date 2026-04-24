import { applyAuthInterceptor } from '../auth.interceptor';

// Mocks
jest.mock('../../../../shared/crypto/rsa', () => ({
  summarizePem: jest.fn(() => 'mock-summary'),
}));

jest.mock('../../../../application', () => ({
  InitDeviceCredentialUseCase: jest.fn(),
}));

import { summarizePem } from '../../../../shared/crypto/rsa';
// Fixtures
const MOCK_FINGERPRINT = 'aa:bb:cc:dd:ee:ff:00:11:22:33';

const MOCK_CREDENTIAL = {
  id: 'device-id-001',
  isInitialized: true,
  keyPair: {
    publicKeyPem: 'mock-public-key-pem',
    privateKeyPem: 'mock-encrypted-private-key',
    fingerprint: MOCK_FINGERPRINT,
    generatedAt: '2026-01-01T00:00:00.000Z',
  },
};

// Helpers
type RequestHandler = (config: any) => Promise<any>;
type ErrorHandler = (error: any) => Promise<any>;

const buildMocks = () => {
  let capturedRequestHandler: RequestHandler | null = null;
  let capturedErrorHandler: ErrorHandler | null = null;

  const axiosInstance = {
    interceptors: {
      request: {
        use: jest.fn(
          (onFulfilled: RequestHandler, onRejected: ErrorHandler) => {
            capturedRequestHandler = onFulfilled;
            capturedErrorHandler = onRejected;
          },
        ),
      },
    },
  };

  const initCredentialUseCase = {
    execute: jest.fn(),
  };

  const getHandlers = () => ({
    requestHandler: capturedRequestHandler!,
    errorHandler: capturedErrorHandler!,
  });

  return { axiosInstance, initCredentialUseCase, getHandlers };
};

const buildConfig = (operationName?: string) => ({
  headers: {
    ...(operationName ? { 'x-operation-name': operationName } : {}),
  } as Record<string, any>,
});

describe('applyAuthInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('interceptor registration', () => {
    it('should register exactly one request interceptor on the axios instance', () => {
      const { axiosInstance, initCredentialUseCase } = buildMocks();

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);

      expect(axiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
    });

    it('should register both a request handler and an error handler', () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);

      const { requestHandler, errorHandler } = getHandlers();
      expect(typeof requestHandler).toBe('function');
      expect(typeof errorHandler).toBe('function');
    });
  });

  describe('request handler — happy path', () => {
    it('should call initCredentialUseCase.execute on every request', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: true,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();

      await requestHandler(buildConfig());

      expect(initCredentialUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should attach X-Public-Key header from the credential', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: true,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();
      const config = buildConfig();

      await requestHandler(config);

      expect(config.headers['X-Public-Key']).toBe(
        MOCK_CREDENTIAL.keyPair.publicKeyPem,
      );
    });

    it('should attach X-Public-Key-Fingerprint header from the credential', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: true,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();
      const config = buildConfig();

      await requestHandler(config);

      expect(config.headers['X-Public-Key-Fingerprint']).toBe(MOCK_FINGERPRINT);
    });

    it('should return the config object after attaching headers', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: true,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();
      const config = buildConfig('CreatePayIn');

      const result = await requestHandler(config);

      expect(result).toBe(config);
    });
  });

  describe('request handler — new credential branch', () => {
    it('should call summarizePem when the credential was just generated', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: false,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();

      await requestHandler(buildConfig());

      expect(summarizePem).toHaveBeenCalledWith(
        MOCK_CREDENTIAL.keyPair.publicKeyPem,
        MOCK_CREDENTIAL.keyPair.fingerprint,
      );
    });

    it('should not call summarizePem when the credential already existed', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: true,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();

      await requestHandler(buildConfig());

      expect(summarizePem).not.toHaveBeenCalled();
    });
  });

  describe('request handler — x-operation-name header', () => {
    it('should include the operation name in the log', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: true,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();

      await requestHandler(buildConfig('CreatePayIn'));

      // console.log is called with a single interpolated string — match its content
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('CreatePayIn'),
      );
    });

    it('should fall back to UnknownOperation when x-operation-name header is absent', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockResolvedValue({
        credential: MOCK_CREDENTIAL,
        alreadyExisted: true,
      });

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();

      await requestHandler(buildConfig());

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('UnknownOperation'),
      );
    });
  });

  describe('request handler — error handling', () => {
    it('should still return the config when initCredentialUseCase.execute throws', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockRejectedValue(
        new Error('Credential init failed'),
      );

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();
      const config = buildConfig('GetPayIn');

      const result = await requestHandler(config);

      expect(result).toBe(config);
    });

    it('should not attach auth headers when initCredentialUseCase.execute throws', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      initCredentialUseCase.execute.mockRejectedValue(
        new Error('Credential init failed'),
      );

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();
      const config = buildConfig();

      await requestHandler(config);

      expect(config.headers['X-Public-Key']).toBeUndefined();
      expect(config.headers['X-Public-Key-Fingerprint']).toBeUndefined();
    });

    it('should log the error when initCredentialUseCase.execute throws', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();
      const mockError = new Error('Credential init failed');
      initCredentialUseCase.execute.mockRejectedValue(mockError);

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { requestHandler } = getHandlers();

      await requestHandler(buildConfig('GetPayIn'));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('GetPayIn'),
        mockError,
      );
    });
  });

  describe('error handler', () => {
    it('should reject with the original error', async () => {
      const { axiosInstance, initCredentialUseCase, getHandlers } =
        buildMocks();

      applyAuthInterceptor(axiosInstance as any, initCredentialUseCase as any);
      const { errorHandler } = getHandlers();

      const axiosError = new Error('Network Error');
      await expect(errorHandler(axiosError)).rejects.toThrow('Network Error');
    });
  });
});
