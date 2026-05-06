import {
  createTumiPayClient,
  CryptoService,
  PayInHttpRepository,
} from '../http';
import {
  DeviceCredentialRepository,
  TransactionCacheRepository,
  UserInformationRepository,
} from '../storage';
import { buildContainer, ContainerDEpendencies } from './container';

//build client http explicit
const tumiPayClient = createTumiPayClient();

//implement specific implementations
const deps: ContainerDEpendencies = {
  cryptoService: new CryptoService(),
  credentialRepo: new DeviceCredentialRepository(),
  userInfoRepo: new UserInformationRepository(),
  payInRepo: new PayInHttpRepository(tumiPayClient),
  cacheRepo: new TransactionCacheRepository(),
};

//Build and export the container (public use cases only)
export const container = buildContainer(deps);
