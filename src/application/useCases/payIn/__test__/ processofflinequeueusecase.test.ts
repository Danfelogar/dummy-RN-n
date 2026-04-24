import {
  ProcessOfflineQueueUseCase,
  QueuedPayIn,
} from '../processOfflineQueueUseCase';
import { PayInMapper } from '../../../../domain';

jest.mock('../../../../domain', () => ({
  PayInMapper: {
    domainToRecord: jest.fn(),
  },
}));

const MOCK_DTO = {
  amount: 100,
  currency: 'USD',
  description: 'test payment',
};

const MOCK_QUEUED_PAY_IN: QueuedPayIn = {
  idempotencyKey: 'idem-key-123',
  dto: MOCK_DTO as any,
};

const MOCK_PAY_IN = {
  id: 'pay-in-1',
  amount: 100,
  status: 'completed',
};

const MOCK_USER_INFO = {
  available_balance: 500,
  spent: 200,
};

const MOCK_TRANSACTION_RECORD = { id: 'record-1', amount: 100 };

// Helpers
const buildMocks = () => {
  const payInRepo = {
    create: jest.fn(),
  };

  const cacheRepo = {
    upsertMany: jest.fn(),
  };

  const userInfoRepo = {
    getAllUserInformation: jest.fn(),
    setAvailableBalance: jest.fn(),
  };

  const dequeue = jest.fn();
  const deductBalance = jest.fn();

  const useCase = new ProcessOfflineQueueUseCase(
    payInRepo as any,
    cacheRepo as any,
    userInfoRepo as any,
  );

  return {
    useCase,
    payInRepo,
    cacheRepo,
    userInfoRepo,
    dequeue,
    deductBalance,
  };
};

describe('ProcessOfflineQueueUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (PayInMapper.domainToRecord as jest.Mock).mockReturnValue(
      MOCK_TRANSACTION_RECORD,
    );
  });

  describe('when queued is null', () => {
    it('should return processed false without calling any dependency', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      const result = await useCase.execute(null, dequeue, deductBalance);

      expect(result).toEqual({ processed: false });
      expect(payInRepo.create).not.toHaveBeenCalled();
      expect(cacheRepo.upsertMany).not.toHaveBeenCalled();
      expect(userInfoRepo.getAllUserInformation).not.toHaveBeenCalled();
      expect(userInfoRepo.setAvailableBalance).not.toHaveBeenCalled();
      expect(dequeue).not.toHaveBeenCalled();
      expect(deductBalance).not.toHaveBeenCalled();
    });
  });

  describe('when queued has a pending PayIn — happy path', () => {
    it('should call payInRepo.create with the original idempotency key', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      payInRepo.create.mockResolvedValue(MOCK_PAY_IN);
      cacheRepo.upsertMany.mockResolvedValue(undefined);
      userInfoRepo.getAllUserInformation.mockResolvedValue(MOCK_USER_INFO);
      userInfoRepo.setAvailableBalance.mockResolvedValue(undefined);

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      expect(payInRepo.create).toHaveBeenCalledWith(
        MOCK_QUEUED_PAY_IN.dto,
        MOCK_QUEUED_PAY_IN.idempotencyKey,
      );
    });

    it('should persist the PayIn into the local cache via upsertMany', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      payInRepo.create.mockResolvedValue(MOCK_PAY_IN);
      cacheRepo.upsertMany.mockResolvedValue(undefined);
      userInfoRepo.getAllUserInformation.mockResolvedValue(MOCK_USER_INFO);
      userInfoRepo.setAvailableBalance.mockResolvedValue(undefined);

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      expect(PayInMapper.domainToRecord).toHaveBeenCalledWith(MOCK_PAY_IN);
      expect(cacheRepo.upsertMany).toHaveBeenCalledWith([
        MOCK_TRANSACTION_RECORD,
      ]);
    });

    it('should compute new balance and call setAvailableBalance with the correct value', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      payInRepo.create.mockResolvedValue(MOCK_PAY_IN);
      cacheRepo.upsertMany.mockResolvedValue(undefined);
      userInfoRepo.getAllUserInformation.mockResolvedValue(MOCK_USER_INFO);
      userInfoRepo.setAvailableBalance.mockResolvedValue(undefined);

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      // available_balance(500) - amount(100) = 400
      expect(userInfoRepo.setAvailableBalance).toHaveBeenCalledWith(400);
    });

    it('should call dequeue exactly once after the API call succeeds', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      payInRepo.create.mockResolvedValue(MOCK_PAY_IN);
      cacheRepo.upsertMany.mockResolvedValue(undefined);
      userInfoRepo.getAllUserInformation.mockResolvedValue(MOCK_USER_INFO);
      userInfoRepo.setAvailableBalance.mockResolvedValue(undefined);

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      expect(dequeue).toHaveBeenCalledTimes(1);
    });

    it('should return processed true and the created PayIn', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      payInRepo.create.mockResolvedValue(MOCK_PAY_IN);
      cacheRepo.upsertMany.mockResolvedValue(undefined);
      userInfoRepo.getAllUserInformation.mockResolvedValue(MOCK_USER_INFO);
      userInfoRepo.setAvailableBalance.mockResolvedValue(undefined);

      const result = await useCase.execute(
        MOCK_QUEUED_PAY_IN,
        dequeue,
        deductBalance,
      );

      expect(result).toEqual({ processed: true, payIn: MOCK_PAY_IN });
    });
  });

  describe('idempotency guarantee', () => {
    it('should never replace the idempotency key with a new one', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      payInRepo.create.mockResolvedValue(MOCK_PAY_IN);
      cacheRepo.upsertMany.mockResolvedValue(undefined);
      userInfoRepo.getAllUserInformation.mockResolvedValue(MOCK_USER_INFO);
      userInfoRepo.setAvailableBalance.mockResolvedValue(undefined);

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      const [, keyUsed] = payInRepo.create.mock.calls[0];
      expect(keyUsed).toBe(MOCK_QUEUED_PAY_IN.idempotencyKey);
    });
  });

  describe('operation order guarantee', () => {
    it('should call dequeue only after payInRepo.create resolves', async () => {
      const {
        useCase,
        payInRepo,
        cacheRepo,
        userInfoRepo,
        dequeue,
        deductBalance,
      } = buildMocks();

      const order: string[] = [];

      payInRepo.create.mockImplementation(async () => {
        order.push('create');
        return MOCK_PAY_IN;
      });
      cacheRepo.upsertMany.mockImplementation(async () => {
        order.push('upsertMany');
      });
      userInfoRepo.getAllUserInformation.mockImplementation(async () => {
        order.push('getAllUserInformation');
        return MOCK_USER_INFO;
      });
      userInfoRepo.setAvailableBalance.mockImplementation(async () => {
        order.push('setAvailableBalance');
      });
      dequeue.mockImplementation(() => {
        order.push('dequeue');
      });

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      expect(order).toEqual([
        'create',
        'upsertMany',
        'getAllUserInformation',
        'setAvailableBalance',
        'dequeue',
      ]);
    });
  });

  describe('error handling', () => {
    it('should return processed false with the error message when payInRepo.create throws', async () => {
      const { useCase, payInRepo, dequeue, deductBalance } = buildMocks();

      payInRepo.create.mockRejectedValue(new Error('Network timeout'));

      const result = await useCase.execute(
        MOCK_QUEUED_PAY_IN,
        dequeue,
        deductBalance,
      );

      expect(result).toEqual({ processed: false, error: 'Network timeout' });
    });

    it('should return processed false with the error message when cacheRepo.upsertMany throws', async () => {
      const { useCase, payInRepo, cacheRepo, dequeue, deductBalance } =
        buildMocks();

      payInRepo.create.mockResolvedValue(MOCK_PAY_IN);
      cacheRepo.upsertMany.mockRejectedValue(new Error('SQLite write failed'));

      const result = await useCase.execute(
        MOCK_QUEUED_PAY_IN,
        dequeue,
        deductBalance,
      );

      expect(result).toEqual({
        processed: false,
        error: 'SQLite write failed',
      });
    });

    it('should return processed false with a fallback message when a non-Error is thrown', async () => {
      const { useCase, payInRepo, dequeue, deductBalance } = buildMocks();

      payInRepo.create.mockRejectedValue('raw string error');

      const result = await useCase.execute(
        MOCK_QUEUED_PAY_IN,
        dequeue,
        deductBalance,
      );

      expect(result).toEqual({
        processed: false,
        error: 'Unknown error during queue flush',
      });
    });

    it('should not call dequeue when an error occurs', async () => {
      const { useCase, payInRepo, dequeue, deductBalance } = buildMocks();

      payInRepo.create.mockRejectedValue(new Error('API down'));

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      expect(dequeue).not.toHaveBeenCalled();
    });

    it('should not call setAvailableBalance when payInRepo.create fails', async () => {
      const { useCase, payInRepo, userInfoRepo, dequeue, deductBalance } =
        buildMocks();

      payInRepo.create.mockRejectedValue(new Error('API down'));

      await useCase.execute(MOCK_QUEUED_PAY_IN, dequeue, deductBalance);

      expect(userInfoRepo.setAvailableBalance).not.toHaveBeenCalled();
    });
  });
});
