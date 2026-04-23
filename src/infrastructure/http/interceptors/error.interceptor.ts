import { AxiosError, AxiosInstance } from 'axios';

export const applyErrorInterceptor = (
  instance: AxiosInstance,
  onAuthError?: () => void,
) => {
  instance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      const op =
        error.config?.headers?.['x-operation-name'] || 'UnknownOperation';

      if (error.response) {
        const { status } = error.response;
        console.error(`HTTP error in ${op}:`, status);

        if (status === 401 || status === 403) {
          console.warn('Authentication failed - session expired');
          onAuthError?.();
        }
      } else if (error.request) {
        // Request was made but no response received (network unreachable, timeout, etc.)
        console.error(`Network error in ${op}:`, error.message);
      } else {
        console.error(`Request error in ${op}:`, error.message);
      }

      return Promise.reject(error);
    },
  );
};
