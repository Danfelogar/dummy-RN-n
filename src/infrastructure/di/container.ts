// Dependency-injection container

import {
  CreatePayInUseCase,
  GetPayInUseCase,
  ICryptoService,
  IDeviceCredentialRepository,
  InitDeviceCredentialUseCase,
  IPayInRepository,
  ITransactionCacheRepository,
  IUserInformationRepository,
  ListPayInsUseCase,
  ListTransactionsUseCase,
  ProcessOfflineQueueUseCase,
} from '../../application';

// Explicit typing of external dependencies
export interface ContainerDEpendencies {
  cryptoService: ICryptoService;
  credentialRepo: IDeviceCredentialRepository;
  userInfoRepo: IUserInformationRepository;
  payInRepo: IPayInRepository;
  cacheRepo: ITransactionCacheRepository;
}

// Public container API: use cases only
export interface AppContainer {
  initDEviceCRedential: InitDeviceCredentialUseCase;
  createPayIn: CreatePayInUseCase;
  getPayIn: GetPayInUseCase;
  listPayIns: ListPayInsUseCase;
  listTransactions: ListTransactionsUseCase;
  processOfflineQueue: ProcessOfflineQueueUseCase;
}

//Factory
export const buildContainer = (deps: ContainerDEpendencies): AppContainer => {
  return {
    initDEviceCRedential: new InitDeviceCredentialUseCase(
      deps.credentialRepo,
      deps.cryptoService,
    ),
    createPayIn: new CreatePayInUseCase(
      deps.payInRepo,
      deps.cryptoService,
      deps.cacheRepo,
      deps.userInfoRepo,
    ),
    getPayIn: new GetPayInUseCase(deps.payInRepo, deps.cacheRepo),
    listPayIns: new ListPayInsUseCase(deps.payInRepo),
    listTransactions: new ListTransactionsUseCase(
      deps.payInRepo,
      deps.cacheRepo,
    ),
    processOfflineQueue: new ProcessOfflineQueueUseCase(
      deps.payInRepo,
      deps.cacheRepo,
      deps.userInfoRepo,
    ),
  };
};
