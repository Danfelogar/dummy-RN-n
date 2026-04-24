// http/client/createClient.ts
import axios, { AxiosInstance } from 'axios';

import { applyErrorInterceptor } from './interceptors/error.interceptor';
import { applyLoggerInterceptor } from './interceptors/logger.interceptor';

interface ClientOptions {
  serviceName?: string; // Label
  apiKey?: string;
  timeout?: number; // Defaults to 10 000 ms
  onAuthError?: () => void; // Called on 401/403
}

export function createClient(
  baseURL: string,
  options: ClientOptions = {},
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: options.timeout ?? 10_000,
    headers: { 'Content-Type': 'application/json' },
  });

  applyLoggerInterceptor(instance, options.serviceName);
  applyErrorInterceptor(instance, options.onAuthError);

  return instance;
}
