// Dependency-injection container
import {
  CreatePayInUseCase,
  GetPayInUseCase,
  InitDeviceCredentialUseCase,
  ListPayInsUseCase,
  ListTransactionsUseCase,
  ProcessOfflineQueueUseCase,
} from '../../application';
import { tumiPayClient } from '../http';
import { CryptoService, PayInHttpRepository } from '../http/services';
import {
  DeviceCredentialRepository,
  TransactionCacheRepository,
  UserInformationRepository,
} from '../storage';
//Infrastructure singletons
const cryptoService = new CryptoService();
const credentialRepo = new DeviceCredentialRepository();
const userInfoRepo = new UserInformationRepository();
const payInRepo = new PayInHttpRepository(tumiPayClient);
const cacheRepo = new TransactionCacheRepository();
//Use-case singletons
const initDeviceCredential = new InitDeviceCredentialUseCase(
  credentialRepo,
  cryptoService,
);

const createPayIn = new CreatePayInUseCase(
  payInRepo,
  cryptoService,
  cacheRepo,
  userInfoRepo,
);

const getPayIn = new GetPayInUseCase(payInRepo);

const listPayIns = new ListPayInsUseCase(payInRepo);

const listTransactions = new ListTransactionsUseCase(payInRepo, cacheRepo);

const processOfflineQueue = new ProcessOfflineQueueUseCase(
  payInRepo,
  cacheRepo,
  userInfoRepo,
);

export const container = {
  // Repos
  userInfoRepo,
  cacheRepo,
  // Use-cases
  initDeviceCredential,
  createPayIn,
  getPayIn,
  listPayIns,
  listTransactions,
  processOfflineQueue,
} as const;
