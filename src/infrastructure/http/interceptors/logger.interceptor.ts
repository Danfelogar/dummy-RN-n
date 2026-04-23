import { AxiosError, AxiosInstance } from 'axios';

export const applyLoggerInterceptor = (
  instance: AxiosInstance,
  serviceName = 'http',
) => {
  instance.interceptors.request.use(config => {
    const op = config.headers?.['x-operation-name'] || 'UnnamedOperation';
    config.metadata = { startTime: Date.now() };
    console.log(`🚀 [${serviceName}] ${op} started`);
    return config;
  });

  instance.interceptors.response.use(
    response => {
      const op =
        response.config.headers?.['x-operation-name'] || 'UnnamedOperation';
      const duration = Date.now() - (response.config.metadata?.startTime || 0);
      console.log(`✅ [${serviceName}] ${op} completed (${duration}ms)`);
      return response;
    },
    (error: AxiosError) => {
      const op =
        error.config?.headers?.['x-operation-name'] || 'UnnamedOperation';
      const duration = Date.now() - (error.config?.metadata?.startTime || 0);
      console.error(
        `❌ [${serviceName}] ${op} failed (${duration}ms):`,
        error.message,
      );
      return Promise.reject(error);
    },
  );
};
